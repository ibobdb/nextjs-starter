import { NextResponse } from 'next/server';
import { statsApi } from '@/services/ts-worker/api/stats';
import { createApiResponse } from '@/types/response';

export async function GET() {
  try {
    const response = await statsApi.getGrowthMetrics();
    return NextResponse.json(createApiResponse(true, 'Growth metrics fetched', response));
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('[API Stats Growth Error]:', err);
    
    // If it's a standardized error from our Axios interceptor
    if (err.status) {
      return NextResponse.json(err, { status: err.status });
    }

    // fallback for unexpected errors
    return NextResponse.json(
      createApiResponse(false, 'Internal Server Error', null, err.message),
      { status: 500 }
    );
  }
}
