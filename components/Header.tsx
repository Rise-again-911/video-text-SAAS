import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {LanguageSwitcher} from './LanguageSwitcher';

export function Header() {
  const t = useTranslations('Common');

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-indigo-600">
          {t('appName')}
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
