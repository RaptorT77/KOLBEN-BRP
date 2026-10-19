const isProd = process.env.NODE_ENV === 'production' || process.env.EXPORT_FOR_GH === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isProd ? '/KOLBEN-BRP' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
