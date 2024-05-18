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
  resolve: {
    fallback: {
      // 브라우저에서 'dns' 모듈이 필요할 때 대체할 모듈 설정
      dns: false  // 브라우저에서 'dns' 모듈을 사용하지 않음
    }
  },
  webpack: function (config, options) {
    // console.log(options.webpack.version); // Should be webpack v5 now
    config.experiments = {
      topLevelAwait: true,
      layers: true,
    };
    config.resolve.fallback = { fs: false };
    return config;
  }
}

module.exports = nextConfig
