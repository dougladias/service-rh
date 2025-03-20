
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  if (status === 'loading') {
    return <div>Carregando...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
    <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto bg-gray-50 ml-64"> 
      <Topbar />
      <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto">
        {children}
      </div>
    </main>
  </div>
  </QueryClientProvider>
  )
}