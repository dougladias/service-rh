'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  Clock 
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Dynamically import Lottie to prevent SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Import your Lottie JSON file
// Import the JSON file directly instead of using the index.ts
import LogoGloboo from '../../../public/logoAnimated.json'

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    href: '/dashboard' 
  },
  { 
    icon: Users, 
    label: 'Funcionários', 
    href: '/dashboard/funcionarios' 
  },
  { 
    icon: FileText, 
    label: 'Folha de Pagamento', 
    href: '/dashboard/folha-pagamento' 
  },
  { 
    icon: FileText, 
    label: 'Relatórios', 
    href: '/dashboard/relatorios' 
  },
  { 
    icon: Clock, 
    label: 'Controle de Ponto', 
    href: '/dashboard/controle-ponto' 
  },
  { 
    icon: Settings, 
    label: 'Configurações', 
    href: '/dashboard/configuracoes' 
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Only render Lottie after component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <aside className="fixed left-0 bt-black h-full w-64 bg-gray-800 border-r shadow-sm z-40">
      <div className="p-4">
        <div className="flex justify-center">
          {isMounted && (
            <Lottie 
              animationData={LogoGloboo} 
              style={{ width: 120, height: 120 }}
              loop={true}
              autoplay={true}
            />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-10 text-center text-cyan-300 mt-4">ADMINISTRADOR</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center p-3 rounded-lg transition-colors duration-200",
                pathname === item.href 
                  ? "bg-black text-cyan-300" 
                  : "hover:bg-gray-700 text-gray-300"
              )}
            >
              <item.icon className="mr-3" size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}