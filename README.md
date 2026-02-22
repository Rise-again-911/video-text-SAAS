# YouTube Transcript → TXT/DOCX (V1)

A Next.js App Router web app for extracting existing YouTube captions/transcripts and exporting as TXT or DOCX.

## Stack
- Next.js + TypeScript + Tailwind CSS
- next-intl for i18n (`/en`, `/zh`, `/ja`, `/es`)
- `@playzone/youtube-transcript` for transcript extraction (server-side)
- `docx` for Word export

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000 (middleware redirects to `/en`).

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## API
- `POST /api/extract`
  - body: `{ url, includeTimestamps?, preferredLanguages? }`
- `GET /api/export/txt?videoId=...&mode=plain|timestamped`
- `GET /api/export/docx?videoId=...&mode=plain|timestamped`

## Notes
- V1 is stateless and uses in-memory cache/rate limiting.
- No ASR. If transcript is unavailable, API returns a friendly error code.
