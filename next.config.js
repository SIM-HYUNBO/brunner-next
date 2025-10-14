/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com", // ← 오타 수정 (amazononaws ❌)
      },
    ],
  },
  webpack: (config, options) => {
    config.experiments = {
      topLevelAwait: true,
      layers: true,
    };

    if (!options.isServer) {
      config.resolve.fallback = { fs: false, dns: false };
    }

    // ✅ Watchpack 에러 방지
    config.watchOptions = {
      ignored: [
        "**/node_modules",
        "**/.git",
        "C:/DumpStack.log.tmp",
        "C:/pagefile.sys",
        "C:/hiberfil.sys",
        "C:/System Volume Information",
      ],
    };

    return config;
  },
};

// ⚠️ 오타 주의: `module.exports` (s 빠졌어요)
module.exports = nextConfig;
