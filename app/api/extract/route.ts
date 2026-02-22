import {NextRequest, NextResponse} from 'next/server';
import {enforceRateLimit, errorResponse, loadTranscriptByUrl} from '@/lib/api';

export async function POST(request: NextRequest) {
  const rateLimited = enforceRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const url = body?.url as string | undefined;
    const preferredLanguages = Array.isArray(body?.preferredLanguages)
      ? body.preferredLanguages.filter((lang: unknown) => typeof lang === 'string')
      : undefined;

    if (!url) {
      return errorResponse('INVALID_URL', 'Please provide a valid YouTube URL.');
    }

    const result = await loadTranscriptByUrl(url, preferredLanguages);
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    if (code === 'INVALID_URL') return errorResponse(code, 'Please provide a valid YouTube URL.');
    if (code === 'VIDEO_UNAVAILABLE')
      return errorResponse(code, 'Video unavailable. It may be private or restricted.', 404);
    if (code === 'TRANSCRIPT_NOT_AVAILABLE')
      return errorResponse(code, 'No transcript/captions are available for this video.', 404);

    return errorResponse('UNKNOWN_ERROR', 'Unexpected server error.', 500);
  }
}
