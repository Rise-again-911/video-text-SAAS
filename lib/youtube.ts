const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
  /(?:youtu\.be\/)([\w-]{11})/,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  /(?:youtube\.com\/embed\/)([\w-]{11})/
];

export function extractVideoId(url: string): string | null {
  for (const pattern of YT_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
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
