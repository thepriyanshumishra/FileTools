import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: Request) {
  // Admin authentication check
  const authHeader = request.headers.get('x-admin-auth');
  if (authHeader !== 'authenticated') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const [tools, actions, browsers, devices] = await Promise.all([
      kv.hgetall('analytics:tools'),
      kv.hgetall('analytics:actions'),
      kv.hgetall('analytics:browsers'),
      kv.hgetall('analytics:devices'),
    ]);

    return NextResponse.json({
      tools: tools || {},
      actions: actions || {},
      browsers: browsers || {},
      devices: devices || {},
      totalEvents: Object.values(actions || {}).reduce((a: number, b: any) => a + Number(b), 0),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
