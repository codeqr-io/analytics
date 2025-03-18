/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // for codeqr proxy
      {
        source: '/_proxy/codeqr/track/click',
        destination: 'https://api.codeqr.io/track/click',
      },
    ];
  },
};

export default nextConfig;
