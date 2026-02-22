import {NextRequest, NextResponse} from 'next/server';
import {Document, Packer, Paragraph, HeadingLevel} from 'docx';
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
    const text = mode === 'timestamped' ? data.transcriptTextTimestamped : data.transcriptTextPlain;

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({text: data.title, heading: HeadingLevel.HEADING_1}),
            ...text.split('\n').filter(Boolean).map((line) => new Paragraph(line))
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
