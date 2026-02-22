import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('Common');

  return (
    <footer className="mx-auto flex max-w-5xl gap-6 px-4 pb-8 text-sm text-slate-500">
      <Link href="/terms">{t('terms')}</Link>
      <Link href="/privacy">{t('privacy')}</Link>
    </footer>
  );
}
