import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { rateLimit, getClientIdentifier } from '@/lib/utils/rate-limit';

export async function POST(request: Request) {
  // Rate limit: 100 requests per hour
  const identifier = getClientIdentifier(request);
  const { success, remaining, resetTime } = rateLimit(identifier, 100);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', resetTime },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString(),
        },
      }
    );
  }

  try {
    const event = await request.json();
    const date = new Date().toISOString().split('T')[0];
    
    // Store event
    await kv.lpush(`analytics:events:${date}`, JSON.stringify(event));
    await kv.expire(`analytics:events:${date}`, 2592000); // 30 days
    
    // Update counters
    await kv.hincrby('analytics:tools', event.tool, 1);
    await kv.hincrby('analytics:actions', event.action, 1);
    if (event.browser) await kv.hincrby('analytics:browsers', event.browser, 1);
    if (event.device) await kv.hincrby('analytics:devices', event.device, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
