import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Contoh tipe payload yang diharapkan dari sistem luar
interface WebhookPayload {
  event_type: 'payment_success' | 'user_upgraded' | 'system_alert';
  data: {
    userId?: string;
    message: string;
    amount?: number;
  };
}

export async function POST(req: Request) {
  try {
    // 1. Dapatkan API Key atau Signature Token dari headers
    // Ini STIKTE HARUS ADA untuk keamanan agar endpoint tidak dipanggil sembarang orang (DDoS/Spam)
    const authHeader = req.headers.get('Authorization');
    const secretKey = process.env.WEBHOOK_SECRET_KEY || 'contoh-rahasia-123';

    if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
      logger.warn('Unauthorized webhook attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Body Request
    const body: WebhookPayload = await req.json();
    logger.info(`Received webhook event: ${body.event_type}`, body);

    // 3. Lakukan Proses Logika Bisnis (Trigger Dashboard)
    // Contoh: Kita buat Notifikasi Sistem dan Audit Log
    
    // Asumsi: Jika tidak ada userId, kita kirim notifikasi ke Admin pertama
    let targetUserId = body.data.userId;
    if (!targetUserId) {
      const adminRole = await prisma.roles.findFirst({ where: { name: 'admin' } });
      const firstAdmin = await prisma.userRole.findFirst({ where: { roleId: adminRole?.id }});
      if (firstAdmin) {
        targetUserId = firstAdmin.userId;
      }
    }

    if (targetUserId) {
      // 3A. Buat Notifikasi (Akan muncul bel/lonceng di dashboard user tersebut)
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: `Sistem Luar: ${body.event_type.replace('_', ' ').toUpperCase()}`,
          message: body.data.message + (body.data.amount ? ` (Total: Rp${body.data.amount})` : ''),
          type: body.event_type === 'system_alert' ? 'WARNING' : 'SUCCESS',
        }
      });
    }

    // 3B. Rekam ke Audit Log
    await prisma.auditLog.create({
      data: {
        action: `WEBHOOK_RECEIVED_${body.event_type.toUpperCase()}`,
        entity: 'System',
        details: body as any, // Simpan payload mentah sebagai bukti
        ipAddress: req.headers.get('x-forwarded-for') || 'external-ip',
      }
    });

    // 4. (Opsional) Trigger event Pusher/Websocket di sini jika Anda menggunakannya
    // misal: await pusher.trigger('admin-channel', 'new-notification', { message: 'Ada transaksi baru' });

    // 5. Kembalikan Response Sukses ke sistem pemanggil
    return NextResponse.json({ 
      success: true, 
      message: 'Berhasil di-trigger, notifikasi telah dibuat di Dashboard' 
    });

  } catch (error) {
    logger.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
