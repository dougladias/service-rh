
import Providers from './providers'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../app/globals.css'

const inter = Inter({ subsets: ['latin'] })

// Metadados do aplicativo
export const metadata: Metadata = {
  title: 'RH Control',
  description: 'Sistema de Gestão de RH',
}
// Layout raiz
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