import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // ==========================
  // 1. ROLES
  // ==========================
  const roleNames = ['super_admin', 'admin', 'manager', 'staff'];

  for (const name of roleNames) {
    await prisma.roles.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('✅ Roles inserted / updated:', roleNames.join(', '));

  // ==========================
  // 2. PERMISSIONS
  // ==========================
  const modules = [
    'dashboard',
    'user',
    'trendscout',
    'roles',
    'permissions',
    'log',
    'settings',
  ];

  const actions = ['read', 'create', 'update', 'delete'];

  const permissionData: { name: string; module: string; description: string }[] = [];

  for (const mod of modules) {
    for (const action of actions) {
      permissionData.push({
        name: `${mod}.${action}`,
        module: mod,
        description: `${action} ${mod}`,
      });
    }
  }

  for (const perm of permissionData) {
    await prisma.permissions.upsert({
      where: { name: perm.name },
      update: { module: perm.module, description: perm.description },
      create: perm,
    });
  }

  console.log(`✅ Permissions inserted / updated: ${permissionData.length} permissions`);

  // ==========================
  // 3. MAP SUPER_ADMIN → ALL PERMISSIONS
  // ==========================
  const superAdmin = await prisma.roles.findFirst({
    where: { name: 'super_admin' },
  });

  if (!superAdmin) {
    throw new Error('super_admin role not found after seeding!');
  }

  const allPermissions = await prisma.permissions.findMany();

  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: superAdmin.id, permissionId: p.id },
      },
      update: {},
      create: {
        roleId: superAdmin.id,
        permissionId: p.id,
      },
    });
  }

  console.log(`✅ super_admin mapped to ALL ${allPermissions.length} permissions`);
  console.log('🌱 Seeding finished!');
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

