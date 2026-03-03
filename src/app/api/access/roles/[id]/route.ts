import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const accessLogger = logger;

// PUT /api/access/roles/[id] — rename role
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  accessLogger.debug(`PUT /api/access/roles/${id} initiated`);
  const guard = await apiGuard('user.update');
  if (guard.error) {
    accessLogger.warn(`PUT /api/access/roles/${id} - Unauthorized access attempt`);
    return guard.error;
  }

  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      accessLogger.warn(`PUT /api/access/roles/${id} - Missing role name`);
      return NextResponse.json(createApiResponse(false, 'Role name is required'), { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '_');

    // Lindungi built-in roles dari rename
    const current = await prisma.roles.findUnique({ where: { id: Number(id) } });
    if (['super_admin', 'admin'].includes(current?.name ?? '')) {
      accessLogger.warn(`PUT /api/access/roles/${id} - Attempt to rename built-in role: ${current?.name}`);
      return NextResponse.json(createApiResponse(false, 'Cannot rename built-in roles'), { status: 403 });
    }

    const role = await prisma.roles.update({
      where: { id: Number(id) },
      data: { name: slug },
    });
    accessLogger.info(`PUT /api/access/roles/${id} - Successfully renamed role to: ${slug}`);
    return NextResponse.json({ success: true, data: role });
  } catch (error) {
    accessLogger.error(`PUT /api/access/roles/${id} - Error renaming role`, error);
    return NextResponse.json(createApiResponse(false, 'Role name already exists'), { status: 409 });
  }
}

// DELETE /api/access/roles/[id] — hapus role (cascade)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  accessLogger.debug(`DELETE /api/access/roles/${id} initiated`);
  const guard = await apiGuard('user.delete');
  if (guard.error) {
    accessLogger.warn(`DELETE /api/access/roles/${id} - Unauthorized access attempt`);
    return guard.error;
  }

  try {
    // Lindungi super_admin dari penghapusan
    const role = await prisma.roles.findUnique({ where: { id: Number(id) } });
    if (role?.name === 'super_admin') {
      accessLogger.warn(`DELETE /api/access/roles/${id} - Attempt to delete super_admin role`);
      return NextResponse.json(createApiResponse(false, 'Cannot delete super_admin role'), { status: 403 });
    }

    await prisma.roles.delete({ where: { id: Number(id) } });
    accessLogger.info(`DELETE /api/access/roles/${id} - Successfully deleted role: ${role?.name}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    accessLogger.error(`DELETE /api/access/roles/${id} - Error deleting role`, error);
    return NextResponse.json(createApiResponse(false, 'Internal Server Error'), { status: 500 });
  }
}
