import {useTranslations} from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('Privacy');

  return (
    <article className="prose max-w-none">
      <h1>{t('title')}</h1>
      <p>{t('body')}</p>
    </article>
  );
}
