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
    const privacyPolicy = '/policies/privacy-policy'
    return [
      { source: '/privacy', destination: privacyPolicy, permanent: true },
      {
        source: '/privacy-notice',
        destination: privacyPolicy,
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: privacyPolicy,
        permanent: true,
      },
      {
        source: '/policies/school-policy',
        destination: '/policies/school-policies',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
