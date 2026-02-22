import { NextResponse } from 'next/server';
import { topicsApi } from '@/services/ts-worker/api/topics';
import { createApiResponse } from '@/types/response';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await topicsApi.rejectCandidate(id);
    return NextResponse.json(createApiResponse(true, 'Candidate rejected successfully', response));
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('[API Topics Reject Error]:', err);
    return NextResponse.json(
      createApiResponse(false, err.message || 'Failed to reject candidate', null, err),
      { status: err.status || 500 }
    );
  }
}
