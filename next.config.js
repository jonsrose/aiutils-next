/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.devtool = 'source-map';
    return config;
  },
}

module.exports = nextConfig
