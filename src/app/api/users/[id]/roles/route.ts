import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createApiResponse } from '@/lib/api-response';
import { apiGuard } from '@/lib/api-guard';

// POST /api/users/[id]/roles — assign role ke user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await apiGuard('user.update');
  if (guard.error) return guard.error;

  const { id } = await params;
  const { roleId } = await request.json();

  if (!roleId) {
    return NextResponse.json(createApiResponse(false, 'roleId is required'), { status: 400 });
  }

  // Cek apakah user sudah punya role ini
  const existing = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId: id,
        roleId: Number(roleId),
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      createApiResponse(false, 'User already has this role'),
      { status: 409 }
    );
  }

  const userRole = await prisma.userRole.create({
    data: {
      userId: id,
      roleId: Number(roleId),
    },
    include: {
      role: true,
    },
  });

  return NextResponse.json(createApiResponse(true, undefined, userRole), { status: 201 });
}

// DELETE /api/users/[id]/roles — unassign role dari user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await apiGuard('user.update');
  if (guard.error) return guard.error;

  const { id } = await params;
  const { roleId } = await request.json();

  if (!roleId) {
    return NextResponse.json(createApiResponse(false, 'roleId is required'), { status: 400 });
  }

  await prisma.userRole.deleteMany({
    where: {
      userId: id,
      roleId: Number(roleId),
    },
  });

  return NextResponse.json(createApiResponse(true));
}
