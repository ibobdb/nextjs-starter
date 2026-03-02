import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';

// GET /api/access/role-permissions?roleId=1
// List semua permissions yang dimiliki suatu role
export async function GET(request: NextRequest) {
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  const roleId = request.nextUrl.searchParams.get('roleId');
  if (!roleId) {
    return NextResponse.json(createApiResponse(false, 'roleId is required'), { status: 400 });
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId: Number(roleId) },
    include: { permission: true },
  });

  return NextResponse.json({
    success: true,
    data: rolePermissions.map((rp) => rp.permission),
  });
}

// POST /api/access/role-permissions — assign permission ke role
export async function POST(request: Request) {
  const guard = await apiGuard('user.update');
  if (guard.error) return guard.error;

  const { roleId, permissionId } = await request.json();
  if (!roleId || !permissionId) {
    return NextResponse.json(
      createApiResponse(false, 'roleId and permissionId are required'),
      { status: 400 }
    );
  }

  try {
    const rp = await prisma.rolePermission.create({
      data: {
        roleId: Number(roleId),
        permissionId: Number(permissionId),
      },
    });
    return NextResponse.json(createApiResponse(true, undefined, rp), { status: 201 });
  } catch {
    return NextResponse.json(
      createApiResponse(false, 'Permission already assigned to role'),
      { status: 409 }
    );
  }
}

// DELETE /api/access/role-permissions — remove permission dari role
export async function DELETE(request: Request) {
  const guard = await apiGuard('user.update');
  if (guard.error) return guard.error;

  const { roleId, permissionId } = await request.json();
  if (!roleId || !permissionId) {
    return NextResponse.json(
      createApiResponse(false, 'roleId and permissionId are required'),
      { status: 400 }
    );
  }

  await prisma.rolePermission.deleteMany({
    where: {
      roleId: Number(roleId),
      permissionId: Number(permissionId),
    },
  });

  return NextResponse.json(createApiResponse(true));
}
