import { NextResponse } from 'next/server';

// Simple in-memory store (resets on deployment)
// For production, use Vercel KV, Postgres, or MongoDB
let globalSettings = {
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
  return NextResponse.json(globalSettings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    globalSettings = { ...globalSettings, ...body };
    return NextResponse.json({ success: true, settings: globalSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
