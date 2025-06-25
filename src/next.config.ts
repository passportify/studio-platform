import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ["*.cluster-3gc7bglotjgwuxlqpiut7yyqt4.cloudworkstations.dev"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
