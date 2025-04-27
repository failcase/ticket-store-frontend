import type { NextConfig } from "next";
import {i18n} from './next-i18next.config';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  devIndicators: false,
  i18n,
};


export default nextConfig;
