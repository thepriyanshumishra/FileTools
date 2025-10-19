import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { rateLimit, getClientIdentifier } from '@/lib/utils/rate-limit';

const SETTINGS_KEY = 'admin:settings';

const defaultSettings = {
  maintenanceMode: false,
  maintenanceMessage: 'Site is under maintenance. Please check back later.',
  maxFileSize: 500,
  enabledTools: {} as Record<string, boolean>,
  siteTitle: 'FileTools - Your Online File Utilities',
  siteDescription: 'Free online tools for converting, compressing, and managing your files',
  enableAnalytics: true,
  enableNotifications: true,
};

export async function GET() {
  try {
    const settings = await kv.get(SETTINGS_KEY) || defaultSettings;
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(request: Request) {
  // Admin authentication check
  const authHeader = request.headers.get('x-admin-auth');
  if (authHeader !== 'authenticated') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Rate limit: 20 requests per hour for admin updates
  const identifier = getClientIdentifier(request);
  const { success, remaining, resetTime } = rateLimit(`admin:${identifier}`, 20);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', resetTime },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate input
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    // Sanitize and validate settings
    const allowedKeys = ['maintenanceMode', 'maintenanceMessage', 'maxFileSize', 'enabledTools', 'siteTitle', 'siteDescription', 'enableAnalytics', 'enableNotifications'];
    const sanitizedBody: any = {};
    
    for (const key of Object.keys(body)) {
      if (allowedKeys.includes(key)) {
        sanitizedBody[key] = body[key];
      }
    }

    const currentSettings = await kv.get(SETTINGS_KEY) || defaultSettings;
    const updatedSettings = { ...currentSettings, ...sanitizedBody };
    await kv.set(SETTINGS_KEY, updatedSettings);
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
