import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  webpack: (config) => {
    config.resolve.modules = [path.resolve(__dirname, 'node_modules'), 'node_modules'];
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mzstatic.com',
      },
    ],
  },
};

export default nextConfig;
