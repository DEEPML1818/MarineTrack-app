const notificationCache = new Map<string, number>();
const THROTTLE_DURATION = 5 * 60 * 1000;

export function shouldSendNotification(key: string): boolean {
  const now = Date.now();
  const lastSent = notificationCache.get(key);
  
  if (!lastSent || now - lastSent > THROTTLE_DURATION) {
    notificationCache.set(key, now);
    return true;
  }
  
  return false;
}

export function clearNotificationThrottle(key?: string): void {
  if (key) {
    notificationCache.delete(key);
  } else {
    notificationCache.clear();
  }
}

export function createNotificationKey(type: string, data?: any): string {
  if (data?.zoneId) {
    return `${type}_${data.zoneId}`;
  }
  if (data?.vesselId) {
    return `${type}_${data.vesselId}`;
  }
  return `${type}_${JSON.stringify(data || {})}`;
}
