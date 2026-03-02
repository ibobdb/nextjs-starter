import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiGuard } from '@/lib/api-guard';
import { getAllSystemConfigs } from '@/lib/config';
import { revalidateTag } from 'next/cache';

export async function GET() {
  const guard = await apiGuard('settings.read');
  if (guard.error) return guard.error;

  try {
    const configs = await getAllSystemConfigs();
    
    // Mask secrets for frontend consumption
    const safeConfigs = configs.map(config => {
      if (config.isSecret) {
        return { ...config, value: '********' };
      }
      return config;
    });

    return NextResponse.json({ success: true, data: safeConfigs });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const guard = await apiGuard('settings.update');
  if (guard.error) return guard.error;

  try {
    const body = await req.json();
    const { settings } = body;

    if (!Array.isArray(settings)) {
      return NextResponse.json({ success: false, error: 'Invalid payload format' }, { status: 400 });
    }

    const updates = [];

    for (const setting of settings) {
      if (!setting.key || typeof setting.value !== 'string') continue;
      
      // Skip updating if it's a masked secret sent from the frontend unmodified
      if (setting.value === '********') continue;

      updates.push(
        prisma.systemConfig.update({
          where: { key: setting.key },
          data: { value: setting.value },
        })
      );
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    // Revalidate Next.js cache so getSystemConfig returns fresh data
    // @ts-expect-error - Next.js 15 canary type definition bug requires a second argument
    revalidateTag('system-config');

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
