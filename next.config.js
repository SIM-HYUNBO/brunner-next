/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'www.notion.so',
      'images.unsplash.com',
      's3.us-west-2.amazononaws.com'
    ],
  },
  webpack: function (config, options) {
    // console.log(options.webpack.version); // Should be webpack v5 now
    config.experiments = {
      topLevelAwait: true,
      layers: true,
    };

    if (!options.isServer)
      config.resolve.fallback = { fs: false, dns: false };
    else
      config.resolve.fallback = { fs: false };

    return config;
  }
}

module.exports = nextConfig
