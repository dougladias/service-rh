'use client'

import Sidebar from '@/components/layout/sidebar'
import Topbar  from '@/components/layout/topbar'
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 ml-64"> {/* Adicionado ml-64 para espaço da sidebar */}
          <Topbar />
          <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  )
}