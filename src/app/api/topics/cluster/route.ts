import { NextResponse } from 'next/server';
import { topicsApi } from '@/services/ts-worker/api/topics';
import { createApiResponse } from '@/types/response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await topicsApi.runClustering({ category: body.category, keyword: body.keyword });
    return NextResponse.json(createApiResponse(true, 'Clustering triggered successfully', response));
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('[API Topics Cluster Error]:', err);
    return NextResponse.json(
      createApiResponse(false, err.message || 'Failed to trigger clustering', null, err),
      { status: err.status || 500 }
    );
  }
}
