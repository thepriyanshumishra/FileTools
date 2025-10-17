export interface AnalyticsEvent {
  tool: string;
  action: 'view' | 'process' | 'download' | 'error';
  fileSize?: number;
  fileType?: string;
  browser?: string;
  device?: string;
  timestamp: number;
}

export async function trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'browser' | 'device'>) {
  try {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      browser: getBrowser(),
      device: getDevice(),
    };

    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullEvent),
    });

    if (response.status === 429) {
      const data = await response.json();
      window.dispatchEvent(new CustomEvent('ratelimit', { detail: data }));
    }
  } catch (error) {
    // Silent fail
  }
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
}

function getDevice(): string {
  if (/mobile/i.test(navigator.userAgent)) return 'Mobile';
  if (/tablet/i.test(navigator.userAgent)) return 'Tablet';
  return 'Desktop';
}
