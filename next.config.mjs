const isGithubActions = process.env.GITHUB_ACTIONS || false;

let basePath = '';
if (isGithubActions) {
  basePath = '/KOLBEN-BRP';
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
