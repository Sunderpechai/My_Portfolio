/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  reactStrictMode: true,
  // Suppress hydration warnings caused by browser extensions
  onError: (err) => {
    if (err.message.includes('Hydration')) {
      return;
    }
  },
};

module.exports = nextConfig;
