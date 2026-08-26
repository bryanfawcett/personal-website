/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Common misspelling of the Origins talk URL
      {
        source: "/orgins-with-perspective",
        destination: "/origins-with-perspective",
        permanent: true,
      },
      {
        source: "/origins",
        destination: "/origins-with-perspective",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
