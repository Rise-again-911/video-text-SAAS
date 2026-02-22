'use client';

import {FormEvent, useMemo, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';

type ExtractResponse = {
  videoId: string;
  videoUrl: string;
  title: string;
  authorName: string;
  transcriptLanguage?: string;
  snippets: {start: number; text: string}[];
  transcriptTextPlain: string;
  transcriptTextTimestamped: string;
};

export function TranscriptForm() {
  const locale = useLocale();
  const t = useTranslations('Home');
  const e = useTranslations('Errors');
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'txt' | 'docx'>('txt');
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractResponse | null>(null);

  const preview = useMemo(() => {
    if (!data) return '';
    return includeTimestamps ? data.transcriptTextTimestamped : data.transcriptTextPlain;
  }, [data, includeTimestamps]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        url,
        includeTimestamps,
        preferredLanguages: locale === 'en' ? ['en'] : [locale, 'en']
      })
    });

    const body = await res.json();
    if (!res.ok) {
      setError(e(body?.error?.code ?? 'UNKNOWN_ERROR'));
      setLoading(false);
      return;
    }

    setData(body);
    setLoading(false);
  }

  function onCopy() {
    navigator.clipboard.writeText(preview);
  }

  function buildExportUrl(type: 'txt' | 'docx') {
    if (!data) return '#';
    const mode = includeTimestamps ? 'timestamped' : 'plain';
    return `/api/export/${type}?videoId=${encodeURIComponent(data.videoId)}&mode=${mode}`;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">{t('headline')}</h1>
        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder={t('inputPlaceholder')}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />

          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={format === 'txt'}
                onChange={() => setFormat('txt')}
              />
              TXT
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={format === 'docx'}
                onChange={() => setFormat('docx')}
              />
              Word (.docx)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeTimestamps}
                onChange={(event) => setIncludeTimestamps(event.target.checked)}
              />
              {t('includeTimestamps')}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? t('generating') : t('generate')}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </section>

      {data && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">{data.title}</h2>
            <p className="text-sm text-slate-500">{data.authorName}</p>
          </div>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-sm leading-relaxed">
            {preview}
          </pre>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onCopy}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {t('copy')}
            </button>
            <a
              className={`rounded-lg px-3 py-2 text-sm text-white ${
                format === 'txt' ? 'bg-indigo-700' : 'bg-slate-900'
              }`}
              href={buildExportUrl('txt')}
            >
              {t('downloadTxt')}
            </a>
            <a
              className={`rounded-lg px-3 py-2 text-sm text-white ${
                format === 'docx' ? 'bg-indigo-700' : 'bg-slate-900'
              }`}
              href={buildExportUrl('docx')}
            >
              {t('downloadDocx')}
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
