const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;

const requestsByIp = new Map<string, number[]>();

export function checkRateLimit(ip: string) {
  const now = Date.now();
  const requests = requestsByIp.get(ip) ?? [];
  const inWindow = requests.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (inWindow.length >= MAX_REQUESTS) {
    requestsByIp.set(ip, inWindow);
    return {ok: false, remaining: 0};
  }

  inWindow.push(now);
  requestsByIp.set(ip, inWindow);

  return {ok: true, remaining: MAX_REQUESTS - inWindow.length};
}
