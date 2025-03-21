'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from "framer-motion"
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
      redirect('/auth/login')
    }
  })

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-cyan-300/20 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-cyan-300 rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          <motion.p
            className="mt-4 text-cyan-300 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Carregando sistema...
          </motion.p>
        </div>
      </div>
    )
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