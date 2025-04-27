// next-i18next.config.js
const path = require('path');

module.exports = {
  i18n: {
    locales: ['ru', 'en'],       // перечислите ваши языки
    defaultLocale: 'ru',         // язык по умолчанию
    localeDetection: true,
  },
  localePath: path.resolve('./public/locales'),
  // Опционально: настройка детектора
  detection: {
    order: ['cookie', 'header'],
    caches: ['cookie'],
    lookupCookie: 'NEXT_LOCALE',
    cookieSecure: process.env.NODE_ENV === 'production',
  },
};
