import { NextResponse, NextRequest } from 'next/server';
import { apiGuard } from '@/lib/api-guard';
import prisma from '@/lib/prisma';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const accessLogger = logger;

// GET /api/access/roles — list semua roles beserta jumlah permissions
export async function GET() {
  accessLogger.debug('GET /api/access/roles initiated');
  const guard = await apiGuard();
  if (guard.error) {
    accessLogger.warn('GET /api/access/roles - Unauthorized access attempt');
    return guard.error;
  }

  try {
    const roles = await prisma.roles.findMany({
      include: {
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    accessLogger.info(`GET /api/access/roles - Successfully fetched ${roles.length} roles`);
    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    accessLogger.error('GET /api/access/roles - Database error', error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}

// POST /api/access/roles — buat role baru
export async function POST(request: NextRequest) {
  accessLogger.debug('POST /api/access/roles initiated');
  const guard = await apiGuard('user.create');
  if (guard.error) {
    accessLogger.warn('POST /api/access/roles - Unauthorized access attempt');
    return guard.error;
  }

  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      accessLogger.warn('POST /api/access/roles - Missing role name');
      return NextResponse.json(createApiResponse(false, 'Role name is required'), { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '_');
    const role = await prisma.roles.create({ data: { name: slug } });
    accessLogger.info(`POST /api/access/roles - Created new role: ${slug}`);
    return NextResponse.json({ success: true, data: role }, { status: 201 });
  } catch (error) {
    accessLogger.error('POST /api/access/roles - Error creating role', error);
    return NextResponse.json(createApiResponse(false, 'Role name already exists'), { status: 409 });
  }
}
