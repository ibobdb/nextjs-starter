import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';

export async function GET(request: Request) {
  try {
    // 1. Basic security check (must be admin/super_admin to view logs)
    const guard = await apiGuard(['super_admin', 'admin']);
    if (guard.error) return guard.error;

    const { searchParams } = new URL(request.url);

    // 2. Pagination mapping
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // 3. Optional Filters
    const actionFilter = searchParams.get('action');
    const entityFilter = searchParams.get('entity');

    const whereClause: Record<string, string> = {};
    if (actionFilter) whereClause.action = actionFilter;
    if (entityFilter) whereClause.entity = entityFilter;

    // 4. Data fetch
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    // 5. Response formatting
    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('[AUDIT_LOG_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
