import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'ja', 'es'],
  defaultLocale: 'en',
  localePrefix: 'always'
});
