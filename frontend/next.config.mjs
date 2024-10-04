/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [];
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,

      fs: false, // the solution
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      "@/*": ["*/**"],
    };
    return config;
  },
};

export default nextConfig;
