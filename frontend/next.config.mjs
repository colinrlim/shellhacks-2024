/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
  webpack(config) {
    config.resolve.fallback = {
      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,

      fs: false, // the solution
    };

    return config;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  webpack: (config) => {
    if (!isServer) {
      config.node = {
        fs: "empty",
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      "@/components": "/app/components",
      "@/constants": "/app/constants",
      "@/hooks": "/app/hooks",
      "@/hoc": "/app/hoc",
      "@/models": "/app/models",
      "@/pages": "/app/pages",
      "@/utils": "/app/utils",
      "@/app": "/app",
      "@/store": "/app/store",
      "@/types": "/app/types",
    };
    return config;
  },
};

export default nextConfig;
