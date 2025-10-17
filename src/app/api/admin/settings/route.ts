import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

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
  try {
    const body = await request.json();
    const currentSettings = await kv.get(SETTINGS_KEY) || defaultSettings;
    const updatedSettings = { ...currentSettings, ...body };
    await kv.set(SETTINGS_KEY, updatedSettings);
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
