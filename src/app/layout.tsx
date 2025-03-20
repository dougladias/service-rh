// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../app/globals.css'
import Providers from './providers'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RH Control',
  description: 'Sistema de Gestão de Recursos Humanos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}