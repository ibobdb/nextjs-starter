import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';

// PUT /api/access/roles/[id] — rename role
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await apiGuard('user.update');
  if (guard.error) return guard.error;

  const { id } = await params;
  const { name } = await request.json();

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json(createApiResponse(false, 'Role name is required'), { status: 400 });
  }

  const slug = name.trim().toLowerCase().replace(/\s+/g, '_');

  // Lindungi built-in roles dari rename
  const current = await prisma.roles.findUnique({ where: { id: Number(id) } });
  if (['super_admin', 'admin'].includes(current?.name ?? '')) {
    return NextResponse.json(createApiResponse(false, 'Cannot rename built-in roles'), { status: 403 });
  }

  try {
    const role = await prisma.roles.update({
      where: { id: Number(id) },
      data: { name: slug },
    });
    return NextResponse.json({ success: true, data: role });
  } catch {
    return NextResponse.json(createApiResponse(false, 'Role name already exists'), { status: 409 });
  }
}

// DELETE /api/access/roles/[id] — hapus role (cascade)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await apiGuard('user.delete');
  if (guard.error) return guard.error;

  const { id } = await params;

  // Lindungi super_admin dari penghapusan
  const role = await prisma.roles.findUnique({ where: { id: Number(id) } });
  if (role?.name === 'super_admin') {
    return NextResponse.json(createApiResponse(false, 'Cannot delete super_admin role'), { status: 403 });
  }

  await prisma.roles.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
