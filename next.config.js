/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [{ source: '/3d', destination: '/lab', permanent: true }];
  },
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    'maath',
    'three-stdlib',
    '@react-spring/three',
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
