import { apiGuard } from '@/lib/api-guard';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const adminLogger = logger;

// GET all menus for administration (no role filtering, but hierarchical)
export async function GET() {
  adminLogger.debug('GET /api/admin/menus initiated');
  const guard = await apiGuard('admin.read');
  if (guard.error) {
    adminLogger.warn('GET /api/admin/menus - Unauthorized access attempt');
    return guard.error;
  }

  try {
    const menus = await prisma.menu.findMany({
      include: {
        children: {
          include: {
            permission: true,
            roles: {
              include: {
                role: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        permission: true,
        roles: {
          include: {
            role: true
          }
        }
      },
      where: {
        parentId: null
      },
      orderBy: {
        order: 'asc'
      }
    });

    adminLogger.info(`GET /api/admin/menus - Successfully fetched ${menus.length} top-level menus`);
    return NextResponse.json(menus);
  } catch (error) {
    adminLogger.error('GET /api/admin/menus - Database error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create a new menu item
export async function POST(req: Request) {
  adminLogger.debug('POST /api/admin/menus initiated');
  const guard = await apiGuard('admin.read');
  if (guard.error) {
    adminLogger.warn('POST /api/admin/menus - Unauthorized access attempt');
    return guard.error;
  }

  try {
    const body = await req.json();
    const { title, url, icon, order, parentId, permissionId, roles } = body;

    const menu = await prisma.$transaction(async (tx) => {
      const newMenu = await tx.menu.create({
        data: {
          title,
          url,
          icon,
          order: order || 0,
          parentId: parentId || null,
          permissionId: permissionId || null,
        }
      });

      if (roles && Array.isArray(roles)) {
        for (const roleId of roles) {
          await tx.menuRole.create({
            data: {
              menuId: newMenu.id,
              roleId: roleId
            }
          });

          // AUTO-SYNC PERMISSION: If menu has a permission requirement, grant it to the role
          if (permissionId) {
            await tx.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: roleId,
                  permissionId: parseInt(permissionId.toString())
                }
              },
              update: {},
              create: {
                roleId: roleId,
                permissionId: parseInt(permissionId.toString())
              }
            });
          }
        }
      }

      return newMenu;
    });

    adminLogger.info(`POST /api/admin/menus - Successfully created menu: ${title}`);
    return NextResponse.json(menu);
  } catch (error: unknown) {
    adminLogger.error('POST /api/admin/menus - Error creating menu', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}

// PUT update a menu item
export async function PUT(req: Request) {
  adminLogger.debug('PUT /api/admin/menus initiated');
  const guard = await apiGuard('admin.read');
  if (guard.error) {
    adminLogger.warn('PUT /api/admin/menus - Unauthorized access attempt');
    return guard.error;
  }

  let menuId: number | undefined;
  try {
    const body = await req.json();
    menuId = body.id;
    if (!menuId) {
      adminLogger.warn('PUT /api/admin/menus - Missing menu ID in body');
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
    }
    const { title, url, icon, order, parentId, permissionId, roles } = body;

    const menu = await prisma.$transaction(async (tx) => {
      const updatedMenu = await tx.menu.update({
        where: { id: menuId as number },
        data: {
          title,
          url,
          icon,
          order,
          parentId: parentId || null,
          permissionId: permissionId || null,
        }
      });

      if (roles && Array.isArray(roles)) {
        // Delete existing roles first
        await tx.menuRole.deleteMany({
          where: { menuId: menuId as number }
        });

        // Add new roles
        for (const roleId of roles) {
          await tx.menuRole.create({
            data: {
              menuId: menuId as number,
              roleId: roleId
            }
          });

          // AUTO-SYNC PERMISSION: If menu has a permission requirement, grant it to the role
          if (permissionId) {
            await tx.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: roleId,
                  permissionId: parseInt(permissionId.toString())
                }
              },
              update: {},
              create: {
                roleId: roleId,
                permissionId: parseInt(permissionId.toString())
              }
            });
          }
        }
      }

      return updatedMenu;
    });

    adminLogger.info(`PUT /api/admin/menus - Successfully updated menu id: ${menuId}`);
    return NextResponse.json(menu);
  } catch (error: unknown) {
    adminLogger.error(`PUT /api/admin/menus - Error updating menu id: ${menuId}`, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}

// DELETE a menu item
export async function DELETE(req: Request) {
  adminLogger.debug('DELETE /api/admin/menus initiated');
  const guard = await apiGuard('admin.read');
  if (guard.error) {
    adminLogger.warn('DELETE /api/admin/menus - Unauthorized access attempt');
    return guard.error;
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    adminLogger.warn('DELETE /api/admin/menus - Missing ID');
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    await prisma.menu.delete({
      where: { id: parseInt(id) }
    });

    adminLogger.info(`DELETE /api/admin/menus - Successfully deleted menu id: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    adminLogger.error(`DELETE /api/admin/menus - Error deleting menu id: ${id}`, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}
