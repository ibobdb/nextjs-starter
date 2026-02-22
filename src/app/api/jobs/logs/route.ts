import { NextResponse } from 'next/server';
import { jobsApi } from '@/services/ts-worker/api/jobs';
import { createApiResponse } from '@/types/response';

export async function GET() {
  try {
    const response = await jobsApi.getLogs();
    // Wrap the response in our standardized ApiResponse structure
    return NextResponse.json(createApiResponse(true, 'Job logs fetched', response));
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('[API Job Logs Error]:', err);
    
    if (err.status) {
      return NextResponse.json(err, { status: err.status });
    }

    return NextResponse.json(
      createApiResponse(false, 'Internal Server Error', null, err.message),
      { status: 500 }
    );
  }
}
