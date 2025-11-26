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
        hostname: "s3.us-west-2.amazonaws.com",
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
        "**/pagefile.sys",
        "**/hiberfil.sys",
        "**/System Volume Information",
      ],
    };

    return config;
  },
};

module.exports = nextConfig;
