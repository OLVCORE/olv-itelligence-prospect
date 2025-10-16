/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ TEMPORÁRIO: Ignora erros de TypeScript no build
    // TODO: Corrigir todos os erros de tipagem gradualmente
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ TEMPORÁRIO: Ignora warnings do ESLint no build
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', '127.0.0.1'],
    unoptimized: true,
  },
  serverExternalPackages: ['puppeteer'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig