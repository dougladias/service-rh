import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remova completamente a seção de rewrites ou ajuste para não afetar auth
  // Não use rewrites para APIs do sistema
}

export default nextConfig