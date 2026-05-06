/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.openai.com', 'images.unsplash.com'],
    unoptimized: true, // Required for static export on some platforms
  },
  // Disable strict mode for production to avoid double-rendering issues
  reactStrictMode: true,
  // Configure trailing slashes for SEO
  trailingSlash: false,
  // Disable eslint during build (we run it separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable typescript errors during build (we check them separately)
  typescript: {
    ignoreBuildErrors: false, // Keep this false to catch errors
  },
  // Production source maps
  productionBrowserSourceMaps: false,
  // Compress output
  compress: true,
}

module.exports = nextConfig
