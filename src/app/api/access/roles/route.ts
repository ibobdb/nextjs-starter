import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';

// GET /api/access/roles — list semua roles beserta jumlah permissions
export async function GET() {
  const guard = await apiGuard();
  if (guard.error) return guard.error;

  const roles = await prisma.roles.findMany({
    include: {
      _count: {
        select: {
          rolePermissions: true,
          userRoles: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  return NextResponse.json({ success: true, data: roles });
}

// POST /api/access/roles — buat role baru
export async function POST(request: NextRequest) {
  const guard = await apiGuard('user.create');
  if (guard.error) return guard.error;

  const { name } = await request.json();
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
  }

  const slug = name.trim().toLowerCase().replace(/\s+/g, '_');

  try {
    const role = await prisma.roles.create({ data: { name: slug } });
    return NextResponse.json({ success: true, data: role }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Role name already exists' }, { status: 409 });
  }
}
