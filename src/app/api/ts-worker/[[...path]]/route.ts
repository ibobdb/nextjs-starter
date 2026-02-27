import { NextRequest, NextResponse } from 'next/server';
import tsWorkerAxios from '@/services/ts-worker/ts.worker.axios.config';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleRequest(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleRequest(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleRequest(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleRequest(request, await params);
}

async function handleRequest(request: NextRequest, params: { path?: string[] }) {
  const pathSegments = params.path || [];
  const endpoint = `/${pathSegments.join('/')}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${endpoint}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const method = request.method.toLowerCase();
    
    // Forward only safe headers if needed, but tsWorkerAxios already handles auth
    
    let body = undefined;
    if (['post', 'put', 'patch'].includes(method)) {
      body = await request.json().catch(() => ({}));
    }

    // Call the worker using our central axios config (which has the API key)
    // IMPORTANT: tsWorkerAxios is already configured with the server-side TS_WORKER_URL and TS_WORKER_KEY
    const axiosInstance = tsWorkerAxios as unknown as Record<string, (url: string, data?: unknown) => Promise<unknown>>;
    const response = await axiosInstance[method](url, body);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error(`[TS-Worker Proxy Error] ${request.method} ${url}:`, error);
    
    const err = error as { message?: string; error?: string; status?: number };
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Error proxying to TS-Worker',
        error: err.error || err.message,
        status: err.status || 500
      },
      { status: err.status || 500 }
    );
  }
}
