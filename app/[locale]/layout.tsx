import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {Header} from '@/components/Header';
import {Footer} from '@/components/Footer';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
