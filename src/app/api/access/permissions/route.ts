import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { logger } from '@/lib/logger';

const accessLogger = logger;

// GET /api/access/permissions — list semua permissions grouped by module
export async function GET() {
  accessLogger.debug('GET /api/access/permissions initiated');
  const guard = await apiGuard();
  if (guard.error) {
    accessLogger.warn('GET /api/access/permissions - Unauthorized access attempt');
    return guard.error;
  }

  const permissions = await prisma.permissions.findMany({
    orderBy: [{ module: 'asc' }, { name: 'asc' }],
  });

  // Group by module
  const grouped = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push(perm);
      return acc;
    },
    {} as Record<string, typeof permissions>
  );

  return NextResponse.json({ success: true, data: { permissions, grouped } });
}
