/** @type {import('next').NextConfig} */
// Fallback Railway : garder la même chaîne que `lib/backend-public-url.ts`
const DEFAULT_PUBLIC_BACKEND_URL = 'https://attentiqbackend-production.up.railway.app';

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_PUBLIC_BACKEND_URL,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
