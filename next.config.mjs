/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Disable Turbopack for now to avoid module format issues
  // turbopack: {
  //   resolveAlias: {
  //     // Add any aliases if needed
  //   }
  // }
}

export default nextConfig
