import {NextRequest, NextResponse} from 'next/server';
import {Document, Packer, Paragraph, HeadingLevel} from 'docx';
import {enforceRateLimit, errorResponse, loadTranscriptByUrl, loadTranscriptByVideoId} from '@/lib/api';
import {safeFilename} from '@/lib/youtube';

type ExportInput = {videoId?: string; url?: string; mode?: 'plain' | 'timestamped'};

async function parseInput(request: NextRequest): Promise<ExportInput> {
  if (request.method === 'POST') {
    const body = (await request.json()) as ExportInput;
    return body ?? {};
  }

  return {
    videoId: request.nextUrl.searchParams.get('videoId') ?? undefined,
    url: request.nextUrl.searchParams.get('url') ?? undefined,
    mode:
      request.nextUrl.searchParams.get('mode') === 'timestamped'
        ? 'timestamped'
        : 'plain'
  };
}

async function resolveData(input: ExportInput) {
  if (input.videoId) return loadTranscriptByVideoId(input.videoId);
  if (input.url) return loadTranscriptByUrl(input.url);
  throw new Error('INVALID_URL');
}

async function handler(request: NextRequest) {
  const rateLimited = enforceRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const input = await parseInput(request);
    const mode = input.mode === 'timestamped' ? 'timestamped' : 'plain';
    const data = await resolveData(input);
    const text = mode === 'timestamped' ? data.transcriptTextTimestamped : data.transcriptTextPlain;

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({text: data.title, heading: HeadingLevel.HEADING_1}),
            ...text
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => new Paragraph(line))
          ]
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeFilename(data.title)}.docx"`
      }
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    return errorResponse(code, 'Unable to export DOCX.', 400);
  }
}

export const GET = handler;
export const POST = handler;
