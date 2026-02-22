'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';

const locales = [
  {value: 'en', label: 'English'},
  {value: 'zh', label: '中文'},
  {value: 'ja', label: '日本語'},
  {value: 'es', label: 'Español'}
] as const;

export function LanguageSwitcher() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="text-sm">
      <span className="mr-2 text-slate-600">{t('language')}</span>
      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1"
        value={locale}
        onChange={(e) => router.replace(pathname, {locale: e.target.value})}
      >
        {locales.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
