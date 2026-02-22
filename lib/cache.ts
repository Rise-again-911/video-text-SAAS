import {Snippet} from './types';

type CacheItem = {
  videoId: string;
  videoUrl: string;
  title: string;
  authorName: string;
  transcriptLanguage?: string;
  snippets: Snippet[];
  transcriptTextPlain: string;
  transcriptTextTimestamped: string;
  updatedAt: number;
};

const CACHE_TTL = 10 * 60 * 1000;
const transcriptCache = new Map<string, CacheItem>();

export function getCache(videoId: string) {
  const item = transcriptCache.get(videoId);
  if (!item) return null;
  if (Date.now() - item.updatedAt > CACHE_TTL) {
    transcriptCache.delete(videoId);
    return null;
  }
  return item;
}

export function setCache(item: Omit<CacheItem, 'updatedAt'>) {
  transcriptCache.set(item.videoId, {...item, updatedAt: Date.now()});
}
