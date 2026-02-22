import {useTranslations} from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('Terms');

  return (
    <article className="prose max-w-none">
      <h1>{t('title')}</h1>
      <p>{t('body')}</p>
    </article>
  );
}
