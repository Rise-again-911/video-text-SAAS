const YT_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be'
]);

export function extractVideoId(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (!YT_HOSTS.has(url.hostname)) {
    return null;
  }

  const host = url.hostname;
  if (host.includes('youtu.be')) {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  }

  const watchId = url.searchParams.get('v');
  if (watchId && /^[\w-]{11}$/.test(watchId)) {
    return watchId;
  }

  const parts = url.pathname.split('/').filter(Boolean);
  const type = parts[0];
  const id = parts[1];
  if ((type === 'shorts' || type === 'embed') && id && /^[\w-]{11}$/.test(id)) {
    return id;
  }

  return null;
}

export async function fetchOEmbed(url: string): Promise<{title: string; author_name: string}> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const response = await fetch(endpoint, {next: {revalidate: 60}});
  if (!response.ok) {
    throw new Error('VIDEO_UNAVAILABLE');
  }
  return response.json();
}

export function buildWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function safeFilename(title: string) {
  return title.replace(/[^a-z0-9\-_. ]/gi, '').trim().replace(/\s+/g, '_') || 'transcript';
}
