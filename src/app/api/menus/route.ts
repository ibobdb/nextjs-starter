import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRoles = session.user.roles || [];
  const userPermissions = session.user.permissions || [];
  const isSuperAdmin = userRoles.includes('super_admin');

  // Fetch all menus that user has roles for
  // A group is visible if it matches the user's role OR its children match the role
  const menus = await prisma.menu.findMany({
    where: {
      AND: [
        { parentId: null },
        {
          OR: [
            { roles: { some: { role: { name: { in: userRoles } } } } },
            { 
              children: { 
                some: { 
                  roles: { some: { role: { name: { in: userRoles } } } } 
                } 
              } 
            }
          ]
        }
      ]
    },
    include: {
      children: {
        where: {
          roles: {
            some: {
              role: {
                name: {
                  in: userRoles
                }
              }
            }
          }
        },
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
    orderBy: {
      order: 'asc'
    }
  });

  // Filter based on permissions if permissionId is present
  const authorizedMenus = (menus as any[]).filter(group => {
    // Super-admin bypasses permission checks
    if (isSuperAdmin) return true;

    // If group has a permission requirement, check it
    if (group.permission && !userPermissions.includes(group.permission.name)) {
      return false;
    }

    // Filter children based on permissions
    group.children = (group.children as any[]).filter((item: any) => {
      if (item.permission && !userPermissions.includes(item.permission.name)) {
        return false;
      }
      return true;
    });

    // Only show group if it has authorized children or a URL
    return group.children.length > 0 || !!group.url;
  });

  return NextResponse.json(authorizedMenus);
}
