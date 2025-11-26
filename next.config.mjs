/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "img.clerk.com" },
    ],
  },
  // Disable experimental features that might cause build trace issues
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;