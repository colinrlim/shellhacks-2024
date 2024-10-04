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
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
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
