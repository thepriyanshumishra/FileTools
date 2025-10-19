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
    
    // Validate event data
    if (!event || typeof event !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid event data' }, { status: 400 });
    }

    // Sanitize event data
    const sanitizedEvent = {
      tool: String(event.tool || '').slice(0, 100),
      action: String(event.action || '').slice(0, 50),
      browser: String(event.browser || '').slice(0, 50),
      device: String(event.device || '').slice(0, 50),
      timestamp: Date.now()
    };

    const date = new Date().toISOString().split('T')[0];
    
    // Store event
    await kv.lpush(`analytics:events:${date}`, JSON.stringify(sanitizedEvent));
    await kv.expire(`analytics:events:${date}`, 2592000); // 30 days
    
    // Update counters with sanitized data
    if (sanitizedEvent.tool) await kv.hincrby('analytics:tools', sanitizedEvent.tool, 1);
    if (sanitizedEvent.action) await kv.hincrby('analytics:actions', sanitizedEvent.action, 1);
    if (sanitizedEvent.browser) await kv.hincrby('analytics:browsers', sanitizedEvent.browser, 1);
    if (sanitizedEvent.device) await kv.hincrby('analytics:devices', sanitizedEvent.device, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
