import type { NextConfig } from "next";
import { i18n as baseI18n } from './next-i18next.config.js';

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  reactStrictMode: true,
  devIndicators: false,
  i18n: {
    // берём все настройки, но переопределяем
    ...baseI18n,
    localeDetection: false, // ← только false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'api.ticket.failcase.dev',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'api.ticket.failcase.dev',
        port: '',
        pathname: '/static/**',
      },
    ],
  },
};


export default nextConfig;
