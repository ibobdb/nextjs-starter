import { NextResponse } from 'next/server';
import { topicsApi } from '@/services/ts-worker/api/topics';
import { createApiResponse } from '@/types/response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const apiResponse = await topicsApi.getTrends(limit);
    const data = apiResponse?.data || apiResponse || [];
    return NextResponse.json(createApiResponse(true, 'Trends fetched successfully', data));
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('[API Topics Trends Error]:', err);
    return NextResponse.json(
      createApiResponse(false, err.message || 'Failed to fetch trends', null, err),
      { status: err.status || 500 }
    );
  }
}
