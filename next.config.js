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
        hostname: "s3.us-west-2.amazononaws.com",
      },
    ],
  },
  webpack: function (config, options) {
    // console.log(options.webpack.version); // Should be webpack v5 now
    config.experiments = {
      topLevelAwait: true,
      layers: true,
    };
    if (!options.isServer) {
      config.resolve.fallback = { fs: false, dns: false };
    }
    return config;
  },
};

module.export = nextConfig;
