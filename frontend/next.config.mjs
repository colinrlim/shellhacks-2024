/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/learn",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
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
  env: {
    NEXT_PUBLIC_FEATURE_MFA: process.env.NEXT_PUBLIC_FEATURE_MFA,
    NEXT_PUBLIC_FEATURE_DATA_EXPORT:
      process.env.NEXT_PUBLIC_FEATURE_DATA_EXPORT,
    NEXT_PUBLIC_FEATURE_DELETE_ACCOUNT:
      process.env.NEXT_PUBLIC_FEATURE_DELETE_ACCOUNT,
    NEXT_PUBLIC_FEATURE_CHANGE_PASSWORD:
      process.env.NEXT_PUBLIC_FEATURE_CHANGE_PASSWORD,
    NEXT_PUBLIC_FEATURE_FONT_SIZE: process.env.NEXT_PUBLIC_FEATURE_FONT_SIZE,
    NEXT_PUBLIC_FEATURE_SECURITY: process.env.NEXT_PUBLIC_FEATURE_SECURITY,
    NEXT_PUBLIC_FEATURE_ACCOUNTDATA:
      process.env.NEXT_PUBLIC_FEATURE_ACCOUNTDATA,
    NEXT_PUBLIC_FEATURE_SETTINGSSEARCH:
      process.env.NEXT_PUBLIC_FEATURE_SETTINGSSEARCH,
  },
};

export default nextConfig;
