import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import tsWorkerAxios from '@/services/ts-worker/ts.worker.axios.config';

// GET /api/modules — list semua module
export async function GET() {
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  try {
    let modules = await prisma.appModule.findMany({
      orderBy: { name: 'asc' },
    });
    
    // Auto-seed TrendScout jika registry kosong pertama kali (Zero-config)
    if (modules.length === 0) {
      const initial = await prisma.appModule.create({
        data: { 
          id: 'trendscout', 
          name: 'TrendScout', 
          description: 'Platform Riset Keyword Cerdas & Manajemen Crawling Trend Otomatis' 
        }
      });
      modules = [initial];
    }
    
    // --- Mulai Ping Sinkronisasi State TS-Worker ---
    // Cari index modul TrendScout
    const tsIndex = modules.findIndex(m => m.id === 'trendscout');
    
    // Jika TrendScout ada di database dan statusnya secara logika nyala, 
    // pastikan Worker server benar-benar merespon.
    if (tsIndex !== -1 && modules[tsIndex].isActive) {
      try {
        await tsWorkerAxios.get('/health', { timeout: 1500 });
      } catch (err) {
        // Jika ECONNREFUSED atau error lain (timeout), paksa status ke OFFLINE di Runtime Response (tidak nulis db)
        modules[tsIndex] = {
          ...modules[tsIndex],
          isActive: false, // Matikan dari perspektif UI
          status: 'OFFLINE', // Beri label Offline
          description: modules[tsIndex].description + ' (WARNING: Python Backend Unreachable)'
        };
      }
    }
    
    return NextResponse.json({ success: true, data: modules });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
