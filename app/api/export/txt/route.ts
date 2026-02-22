import {NextRequest, NextResponse} from 'next/server';
import {enforceRateLimit, errorResponse, loadTranscriptByUrl, loadTranscriptByVideoId} from '@/lib/api';
import {safeFilename} from '@/lib/youtube';

async function resolveData(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId');
  const url = request.nextUrl.searchParams.get('url');

  if (videoId) return loadTranscriptByVideoId(videoId);
  if (url) return loadTranscriptByUrl(url);
  throw new Error('INVALID_URL');
}

export async function GET(request: NextRequest) {
  const rateLimited = enforceRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const mode = request.nextUrl.searchParams.get('mode') === 'timestamped' ? 'timestamped' : 'plain';
    const data = await resolveData(request);
    const content = mode === 'timestamped' ? data.transcriptTextTimestamped : data.transcriptTextPlain;

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeFilename(data.title)}.txt"`
      }
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    return errorResponse(code, 'Unable to export TXT.', 400);
  }
}
