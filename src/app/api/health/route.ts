import { NextResponse } from 'next/server';
import { healthCheck } from '@/services/ts-worker/api/health-check';
import { createApiResponse } from '@/types/response';

export async function GET() {
  try {
    const response = await healthCheck();
    return NextResponse.json(response);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('[API Health Check Error]:', err);
    
    if (err.status) {
      return NextResponse.json(err, { status: err.status });
    }

    return NextResponse.json(
      createApiResponse(false, 'Internal Server Error', null, err.message),
      { status: 500 }
    );
  }
}
