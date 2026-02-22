import {NextRequest, NextResponse} from 'next/server';
import {checkRateLimit} from './rateLimit';
import {ApiError} from './types';
import {getCache, setCache} from './cache';
import {buildWatchUrl, extractVideoId, fetchOEmbed} from './youtube';
import {fetchTranscript, formatPlain, formatTimestamped} from './transcript';

export function errorResponse(code: string, message: string, status = 400) {
  return NextResponse.json({error: {code, message}} satisfies ApiError, {status});
}

export function clientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

export function enforceRateLimit(request: NextRequest) {
  const result = checkRateLimit(clientIp(request));
  if (!result.ok) {
    return errorResponse('RATE_LIMITED', 'Too many requests. Please try again later.', 429);
  }
  return null;
}

export async function loadTranscriptByUrl(url: string, preferredLanguages?: string[]) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('INVALID_URL');
  }

  const cached = getCache(videoId);
  if (cached) return cached;

  const meta = await fetchOEmbed(buildWatchUrl(videoId));
  const transcript = await fetchTranscript(videoId, preferredLanguages);

  const payload = {
    videoId,
    videoUrl: buildWatchUrl(videoId),
    title: meta.title,
    authorName: meta.author_name,
    transcriptLanguage: transcript.languageCode,
    snippets: transcript.snippets,
    transcriptTextPlain: formatPlain(transcript.snippets),
    transcriptTextTimestamped: formatTimestamped(transcript.snippets)
  };

  setCache(payload);
  return payload;
}

export async function loadTranscriptByVideoId(videoId: string) {
  const cached = getCache(videoId);
  if (cached) return cached;
  return loadTranscriptByUrl(buildWatchUrl(videoId));
}
