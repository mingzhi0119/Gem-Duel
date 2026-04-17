import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    transpilePackages: ['@gem-duel/application', '@gem-duel/contracts', '@gem-duel/ui'],
};

export default nextConfig;
