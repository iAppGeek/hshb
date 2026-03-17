/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  reactCompiler: true,
  images: {
    remotePatterns: [{ hostname: 'images.ctfassets.net' }],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
