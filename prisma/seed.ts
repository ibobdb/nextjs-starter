import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting transactional seeding of Base Project...');

  const DEFAULT_ADMIN_EMAIL = 'admin@starter.com';
  const DEFAULT_ADMIN_ID = '23325e20-42ee-4446-8538-8a70142ecf57';
  const DEFAULT_ADMIN_PASSWORD = 'superadmin123';

  await prisma.$transaction(async (tx) => {
    // 0. CLEANUP LEGACY DATA
    console.log('Cleaning up legacy data (trendscout)...');
    await tx.menu.deleteMany({
      where: {
        OR: [
          { title: { contains: 'trendscout', mode: 'insensitive' } },
          { url: { contains: 'trendscout', mode: 'insensitive' } }
        ]
      }
    });
    await tx.permissions.deleteMany({
      where: {
        OR: [
          { name: { contains: 'trendscout', mode: 'insensitive' } },
          { module: { contains: 'trendscout', mode: 'insensitive' } }
        ]
      }
    });

    // 1. ROLES
    const roleNames = ['super_admin', 'admin', 'user'];
    console.log('Ensuring roles...');
    for (const name of roleNames) {
      await tx.roles.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    // 2. PERMISSIONS
    const modules = [
      'admin',
      'dashboard',
      'user',
      'roles',
      'permissions',
      'log',
      'settings',
      'teams',
      'notifications',
      'broadcast',
    ];
    const actions = ['read', 'create', 'update', 'delete', 'manage'];
    const permissionData = [];

    for (const mod of modules) {
      for (const action of actions) {
        permissionData.push({
          name: `${mod}.${action}`,
          module: mod,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${mod}`,
        });
      }
    }

    console.log(`Upserting ${permissionData.length} permissions...`);
    for (const perm of permissionData) {
      await tx.permissions.upsert({
        where: { name: perm.name },
        update: { module: perm.module, description: perm.description },
        create: perm,
      });
    }

    // 3. SUPER ADMIN USER
    console.log(`Ensuring user: ${DEFAULT_ADMIN_EMAIL}`);
    const user = await tx.user.upsert({
      where: { email: DEFAULT_ADMIN_EMAIL },
      update: {
        role: 'admin',
        banned: false,
      },
      create: {
        id: DEFAULT_ADMIN_ID,
        name: 'Super Admin',
        email: DEFAULT_ADMIN_EMAIL,
        emailVerified: true,
        role: 'admin',
        banned: false,
      },
    });

    // 4. BETTER AUTH ACCOUNT (PASSWORD)
    const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);
    
    // We use findFirst or similar if we are not sure about unique constraints yet
    // but here we know the schema says @@unique([providerId, accountId])
    const existingAccount = await tx.account.findFirst({
      where: {
        providerId: 'credential',
        accountId: DEFAULT_ADMIN_EMAIL,
      },
    });

    if (existingAccount) {
      await tx.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword },
      });
    } else {
      await tx.account.create({
        data: {
          id: 'default-admin-account-id',
          userId: user.id,
          accountId: DEFAULT_ADMIN_EMAIL,
          providerId: 'credential',
          password: hashedPassword,
        },
      });
    }

    // 5. MAP ROLES TO USER (Single Role Enforcement)
    const superAdminRole = await tx.roles.findFirst({ where: { name: 'super_admin' } });
    const userRole = await tx.roles.findFirst({ where: { name: 'user' } });

    if (superAdminRole && user) {
      // Clear existing roles for this user to ensure only 1 role
      await tx.userRole.deleteMany({ where: { userId: user.id } });
      
      await tx.userRole.create({
        data: { userId: user.id, roleId: superAdminRole.id },
      });
      console.log(`Assigned only super_admin role to ${DEFAULT_ADMIN_EMAIL}`);
    }

    // 6. MAP PERMISSIONS TO ROLES
    if (superAdminRole) {
      const allPermissions = await tx.permissions.findMany();
      console.log(`Mapping all ${allPermissions.length} permissions to super_admin...`);
      for (const p of allPermissions) {
        await tx.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: superAdminRole.id, permissionId: p.id },
          },
          update: {},
          create: {
            roleId: superAdminRole.id,
            permissionId: p.id,
          },
        });
      }
    }

    if (userRole) {
      const userBasePermissions = ['dashboard.read', 'user.read', 'notifications.read'];
      console.log(`Mapping ${userBasePermissions.length} base permissions to user role...`);
      for (const name of userBasePermissions) {
        const perm = await tx.permissions.findUnique({ where: { name } });
        if (perm) {
          await tx.rolePermission.upsert({
            where: {
              roleId_permissionId: { roleId: userRole.id, permissionId: perm.id },
            },
            update: {},
            create: {
              roleId: userRole.id,
              permissionId: perm.id,
            },
          });
        }
      }
    }

    // 7. SYSTEM CONFIGURATION
    const initialConfigs = [
      { key: 'APP_NAME', value: 'DBStudio Dashboard', description: 'Application Name', isSecret: false },
      { key: 'APP_DESCRIPTION', value: 'A powerful Next.js RBAC platform', description: 'Application Description (SEO)', isSecret: false },
      { key: 'COMPANY_NAME', value: 'DBStudio', description: 'Company Legal Name', isSecret: false },
      { key: 'APP_URL', value: 'http://localhost:3000', description: 'Base Application URL', isSecret: false },
      { key: 'EMAIL_FROM', value: 'onboarding@resend.dev', description: 'Default sender email address', isSecret: false },
    ];

    for (const config of initialConfigs) {
      await tx.systemConfig.upsert({
        where: { key: config.key },
        update: {},
        create: config,
      });
    }

    // ==========================
    // 8. DYNAMIC MENUS
    // ==========================
    console.log('Seeding initial dynamic menus...');

    // [FIX] Clear existing menus to avoid duplication on multiple seed runs
    await tx.menuRole.deleteMany();
    await tx.menu.deleteMany();
    
    interface MenuItemSeed {
      title: string;
      url: string;
      icon: string;
      roles: string[];
      permission?: string;
    }

    interface MenuGroupSeed {
      label: string;
      roles: string[];
      permission?: string;
      items: MenuItemSeed[];
    }

    const menuGroups: MenuGroupSeed[] = [
      {
        label: 'Dashboard',
        roles: ['super_admin', 'admin', 'user'],
        items: [
          { title: 'Default', url: '/dashboard/default', icon: 'Home', roles: ['super_admin', 'admin', 'user'] },
        ]
      },
      {
        label: 'Testing / Lab',
        roles: ['super_admin', 'admin'],
        permission: 'admin.read',
        items: [
          { title: 'Integration Lab', url: '/dashboard/lab', icon: 'Beaker', roles: ['super_admin', 'admin'], permission: 'admin.read' },
        ]
      },
      {
        label: 'User & Access',
        roles: ['super_admin', 'admin'],
        permission: 'admin.read',
        items: [
          { title: 'Users', url: '/dashboard/users', icon: 'User2', roles: ['super_admin', 'admin'], permission: 'admin.read' },
          { title: 'Teams', url: '/dashboard/teams', icon: 'Users', roles: ['super_admin', 'admin'], permission: 'admin.read' },
          { title: 'Access Control', url: '/dashboard/access', icon: 'ShieldCheck', roles: ['super_admin', 'admin'], permission: 'admin.read' },
          { title: 'System Broadcast', url: '/dashboard/broadcast', icon: 'Megaphone', roles: ['super_admin', 'admin'], permission: 'broadcast.read' },
        ]
      },
      {
        label: 'System Configuration',
        roles: ['super_admin', 'admin'],
        permission: 'admin.read',
        items: [
          { title: 'System Settings', url: '/dashboard/settings/system', icon: 'Settings', roles: ['super_admin', 'admin'], permission: 'admin.read' },
        ]
      },
    ];

    let groupOrder = 0;
    for (const groupData of menuGroups) {
      const groupPerm = groupData.permission 
        ? await tx.permissions.findUnique({ where: { name: groupData.permission } }) 
        : null;

      const group = await tx.menu.create({
        data: {
          title: groupData.label,
          order: groupOrder++,
          permissionId: groupPerm?.id,
        }
      });

      // Map roles to group
      for (const roleName of groupData.roles) {
        const role = await tx.roles.findUnique({ where: { name: roleName } });
        if (role) {
          await tx.menuRole.create({
            data: { menuId: group.id, roleId: role.id }
          });
        }
      }

      // Items
      let itemOrder = 0;
      for (const itemData of groupData.items) {
        const itemPerm = itemData.permission 
          ? await tx.permissions.findUnique({ where: { name: itemData.permission } }) 
          : null;

        const item = await tx.menu.create({
          data: {
            title: itemData.title,
            url: itemData.url,
            icon: itemData.icon,
            order: itemOrder++,
            parentId: group.id,
            permissionId: itemPerm?.id,
          }
        });

        // Map roles to item
        for (const roleName of itemData.roles) {
          const role = await tx.roles.findUnique({ where: { name: roleName } });
          if (role) {
            await tx.menuRole.create({
              data: { menuId: item.id, roleId: role.id }
            });
          }
        }
      }
    }
    console.log(`✅ Seeded ${menuGroups.length} menu groups and their items`);
  });

  console.log('Seeding finished successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
