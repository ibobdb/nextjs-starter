import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // also fetch a raw user to see if it has roles
  const users = await prisma.user.findMany({
    include: {
      userRoles: {
        include: { role: true }
      }
    }
  });

  return NextResponse.json({
    session,
    dbUsers: users
  });
}
