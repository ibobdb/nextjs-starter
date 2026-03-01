import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import tsWorkerAxios from '@/services/ts-worker/ts.worker.axios.config';

// PUT /api/modules/[id] — update status atau isActive dari modul
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Hanya super_admin yang bisa mengatur nyala mati module
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  const user = guard.session.user;
  if (!user.roles.includes('super_admin')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden',
        message: 'Hanya super_admin yang dapat mengatur Registry Modul',
      },
      { status: 403 }
    );
  }

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { isActive, status } = body;

    // --- Validasi Ping Aktifasi Modul Eksternal ---
    // Jika User ingin menyalakan modul TrendScout (isActive = true)
    if (id === 'trendscout' && isActive === true) {
      try {
        await tsWorkerAxios.get('/health', { timeout: 2000 });
      } catch (err) {
        return NextResponse.json(
          {
            success: false,
            error: 'Service Unavailable',
            message: 'Gagal menyalakan modul. Node ts-worker backend Python (\`127.0.0.1:8000\`) sedang mati atau tidak dapat dijangkau.',
          },
          { status: 503 }
        );
      }
    }

    const updated = await prisma.appModule.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
