import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { createApiResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { canManageRole } from '@/lib/role-hierarchy';

const accessLogger = logger;

// GET /api/access/role-permissions?roleId=1
// List semua permissions yang dimiliki suatu role
export async function GET(request: NextRequest) {
  const roleId = request.nextUrl.searchParams.get('roleId');
  accessLogger.debug(`GET /api/access/role-permissions initiated for roleId: ${roleId}`);
  const guard = await apiGuard();
  if (guard.error) {
    accessLogger.warn('GET /api/access/role-permissions - Unauthorized access attempt');
    return guard.error;
  }
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

  const actorRoles = guard.session.user.roles ?? [];
  const { roleId, permissionId } = await request.json();

  if (!roleId || !permissionId) {
    return NextResponse.json(
      createApiResponse(false, 'roleId and permissionId are required'),
      { status: 400 }
    );
  }

  // Hierarchy check: can the actor manage the target role?
  const targetRole = await prisma.roles.findUnique({ where: { id: Number(roleId) } });
  if (!targetRole) {
    return NextResponse.json(createApiResponse(false, 'Role not found'), { status: 404 });
  }
  if (!canManageRole(actorRoles, targetRole.name)) {
    accessLogger.warn(`POST /api/access/role-permissions - Actor cannot manage role: ${targetRole.name}`);
    return NextResponse.json(
      createApiResponse(false, `You do not have permission to modify permissions for the '${targetRole.name}' role`),
      { status: 403 }
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

  const actorRoles = guard.session.user.roles ?? [];
  const { roleId, permissionId } = await request.json();

  if (!roleId || !permissionId) {
    return NextResponse.json(
      createApiResponse(false, 'roleId and permissionId are required'),
      { status: 400 }
    );
  }

  // Hierarchy check: can the actor manage the target role?
  const targetRole = await prisma.roles.findUnique({ where: { id: Number(roleId) } });
  if (!targetRole) {
    return NextResponse.json(createApiResponse(false, 'Role not found'), { status: 404 });
  }
  if (!canManageRole(actorRoles, targetRole.name)) {
    accessLogger.warn(`DELETE /api/access/role-permissions - Actor cannot manage role: ${targetRole.name}`);
    return NextResponse.json(
      createApiResponse(false, `You do not have permission to modify permissions for the '${targetRole.name}' role`),
      { status: 403 }
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
