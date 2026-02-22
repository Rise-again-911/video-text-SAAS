import {YoutubeTranscript} from '@playzone/youtube-transcript';
import {Snippet} from './types';

function normalize(items: Array<{text: string; offset?: number; start?: number}>) {
  return items
    .map((item) => ({start: item.start ?? item.offset ?? 0, text: item.text?.trim() ?? ''}))
    .filter((item) => item.text.length > 0);
}

export async function fetchTranscript(videoId: string, preferredLanguages?: string[]) {
  const client = YoutubeTranscript as unknown as {
    fetchTranscript: (
      videoId: string,
      options?: {lang?: string}
    ) => Promise<Array<{text: string; offset?: number; start?: number}>>;
  };

  const languages = preferredLanguages && preferredLanguages.length > 0 ? preferredLanguages : ['en'];

  for (const lang of languages) {
    try {
      const result = await client.fetchTranscript(videoId, {lang});
      const snippets = normalize(result);
      if (snippets.length > 0) {
        return {snippets, languageCode: lang};
      }
    } catch {
      // try next language
    }
  }

  try {
    const fallback = await client.fetchTranscript(videoId);
    const snippets = normalize(fallback);
    if (snippets.length > 0) {
      return {snippets, languageCode: undefined};
    }
  } catch {
    throw new Error('TRANSCRIPT_NOT_AVAILABLE');
  }

  throw new Error('TRANSCRIPT_NOT_AVAILABLE');
}

export function formatPlain(snippets: Snippet[]): string {
  const joined = snippets.map((s) => s.text).join(' ');
  return joined.replace(/\s+/g, ' ').replace(/([.!?])\s+/g, '$1\n\n').trim();
}

function mmss(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

export function formatTimestamped(snippets: Snippet[]): string {
  return snippets.map((s) => `[${mmss(s.start)}] ${s.text}`).join('\n');
}
