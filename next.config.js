/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  reactCompiler: true,
  images: {
    remotePatterns: [{ hostname: 'images.ctfassets.net' }],
    formats: ['image/avif', 'image/webp'],
  },
  // Common short or legacy URLs for the policies. `/privacy-notice` is the
  // link printed on older registration material and used by the portal.
  redirects() {
    return ['/privacy', '/privacy-notice', '/privacy-policy'].map((source) => ({
      source,
      destination: '/policies',
      permanent: true,
    }))
  },
}

module.exports = nextConfig
