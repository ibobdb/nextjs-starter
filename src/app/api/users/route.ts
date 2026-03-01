import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';

// GET /api/users — list semua users dengan role-nya
export async function GET() {
  const guard = await apiGuard('user.read');
  if (guard.error) return guard.error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      userRoles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: users });
}
