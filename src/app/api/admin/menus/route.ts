import { apiGuard } from '@/lib/api-guard';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all menus for administration (no role filtering, but hierarchical)
export async function GET() {
  const guard = await apiGuard('admin.read');
  if (guard.error) return guard.error;

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

  return NextResponse.json(menus);
}

// POST create a new menu item
export async function POST(req: Request) {
  const guard = await apiGuard('admin.read');
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const { title, url, icon, order, parentId, permissionId, roles } = body;

    const menu = await prisma.$transaction(async (tx: any) => {
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

    return NextResponse.json(menu);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT update a menu item
export async function PUT(req: Request) {
  const guard = await apiGuard('admin.read');
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const { id, title, url, icon, order, parentId, permissionId, roles } = body;

    const menu = await prisma.$transaction(async (tx: any) => {
      const updatedMenu = await tx.menu.update({
        where: { id },
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
          where: { menuId: id }
        });

        // Add new roles
        for (const roleId of roles) {
          await tx.menuRole.create({
            data: {
              menuId: id,
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

    return NextResponse.json(menu);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE a menu item
export async function DELETE(req: Request) {
  const guard = await apiGuard('admin.read');
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    await prisma.menu.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
