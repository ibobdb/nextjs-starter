import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { items } from '@/data/siderbar';
import { logAudit } from '@/lib/audit-logger';

export async function POST() {
  try {
    // 1. Security Check (Only super admin can generate permissions)
    const guard = await apiGuard(['super_admin']);
    if (guard.error) return guard.error;

    const { session } = guard;
    const user = session.user;

    // 2. Traverse the sidebar tree to extract unique permissions
    const discoveredPermissions = new Map<string, { module: string; description: string }>();

    for (const group of items) {
      if (group.permission) {
        discoveredPermissions.set(group.permission, {
          module: group.moduleId || group.label.toLowerCase().replace(/\s+/g, "_"),
          description: `Access to ${group.label} group menu`,
        });
      }

      for (const item of group.items) {
        if (item.permission) {
          discoveredPermissions.set(item.permission, {
            module: group.moduleId || group.label.toLowerCase().replace(/\s+/g, "_"),
            description: `Access to ${item.title} menu item`,
          });
        }
      }
    }

    // 2.5 Inject Hardcoded Backend Action Permissions that are not bound to menus
    const actionPermissions = [
      { name: 'user.update', module: 'admin', description: 'Can modify user attributes and roles' },
      { name: 'team.write', module: 'admin', description: 'Can create, update, or delete teams' },
      { name: 'role.write', module: 'admin', description: 'Can create, modify and manage system wide roles' },
      { name: 'module.write', module: 'admin', description: 'Can toggle modules offline or online globally' },
      { name: 'trendscout.write', module: 'trendscout', description: 'Can manage TrendScout data' },
      // Specifically ensure super_admin is at least registered as a permission concept for fallback
      { name: 'super_admin', module: 'core', description: 'Absolute bypass permission' },
    ];

    for (const action of actionPermissions) {
      if (!discoveredPermissions.has(action.name)) {
        discoveredPermissions.set(action.name, {
          module: action.module,
          description: action.description
        });
      }
    }

    // 3. Upsert them into the database
    let addedCount = 0;
    let updatedCount = 0;

    for (const [permName, data] of discoveredPermissions.entries()) {
      const existing = await prisma.permissions.findUnique({
        where: { name: permName }
      });

      if (!existing) {
        await prisma.permissions.create({
          data: {
            name: permName,
            module: data.module,
            description: data.description,
          }
        });
        addedCount++;
      } else {
        // Just update module/description in case they shifted
        await prisma.permissions.update({
          where: { name: permName },
          data: {
            module: data.module,
            description: data.description,
          }
        });
        updatedCount++;
      }
    }

    // 4. Log the action
    if (addedCount > 0 || updatedCount > 0) {
      await logAudit({
        action: "SYNC_PERMISSIONS",
        entity: "Permission",
        userId: user.id,
        details: { newlyAdded: addedCount, updated: updatedCount }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Permissions synced. ${addedCount} added, ${updatedCount} updated.`,
      data: { added: addedCount, updated: updatedCount }
    });

  } catch (error: any) {
    console.error('[SYNC_PERMISSIONS_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
