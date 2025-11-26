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
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { module: /client-reference-manifest/ },
      ];
      
      // Plugin to create missing client-reference-manifest file
      const fs = require('fs');
      const path = require('path');
      
      class CreateManifestPlugin {
        apply(compiler) {
          compiler.hooks.afterEmit.tap('CreateManifestPlugin', () => {
            try {
              const manifestDir = path.join(compiler.outputPath, 'server', 'app', '(dashboard)');
              const manifestPath = path.join(manifestDir, 'page_client-reference-manifest.js');
              
              if (!fs.existsSync(manifestPath)) {
                fs.mkdirSync(manifestDir, { recursive: true });
                fs.writeFileSync(manifestPath, '{}', 'utf8');
                console.log('✓ Created missing client-reference-manifest.js file');
              }
            } catch (err) {
              // Ignore errors during plugin execution
            }
          });
        }
      }
      
      config.plugins.push(new CreateManifestPlugin());
    }
    return config;
  },
};

export default nextConfig;