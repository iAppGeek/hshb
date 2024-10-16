/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'images.ctfassets.net' }],
  },
}

module.exports = nextConfig
