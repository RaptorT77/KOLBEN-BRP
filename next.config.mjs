const isExport = process.env.EXPORT_FOR_GH === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isExport ? '/KOLBEN-BRP' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
