/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "img.clerk.com" },
    ],
  },
  // Disable build trace collection to avoid ENOENT errors on Vercel
  experimental: {
    optimizePackageImports: [],
  },
  // Suppress build warnings for missing client reference manifests
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { module: /client-reference-manifest/ },
      ];
    }
    return config;
  },
};

export default nextConfig;