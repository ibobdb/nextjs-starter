import { NextResponse } from 'next/server';
import { topicsApi } from '@/services/ts-worker/api/topics';
import { createApiResponse } from '@/types/response';
import { TopicCandidate } from '@/services/ts-worker/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'generated';
    
    // Pass status to the worker API
    const apiResponse = await topicsApi.getCandidates({ status });
    
    // Extract candidates array from ApiResponse.data
    const candidates = (apiResponse?.data || apiResponse || []) as unknown as TopicCandidate[];
    
    // Filter locally if status is provided
    let filteredData: TopicCandidate[] = Array.isArray(candidates) ? candidates : [];
    if (status) {
        filteredData = filteredData.filter((c) => c.status === status);
    }

    return NextResponse.json(createApiResponse(true, 'Candidates fetched successfully', filteredData));
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('[API Topics Candidates Error]:', err);
    return NextResponse.json(
      createApiResponse(false, err.message || 'Failed to fetch candidates', null, err),
      { status: err.status || 500 }
    );
  }
}
