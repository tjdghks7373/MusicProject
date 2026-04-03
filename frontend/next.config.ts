import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com", // iTunes API 이미지 호스트
      },
      {
        protocol: "https",
        hostname: "i.scdn.co", // Spotify 이미지 호스트
      },
    ],
  },
};

export default nextConfig;
