
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings 
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    icon: Settings, 
    label: 'Configurações', 
    href: '/dashboard/configuracoes' 
  }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-17 bt-black h-full w-64 bg-white border-r shadow-sm z-40">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-10 text-center">RH Control</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center p-3 rounded-lg transition-colors duration-200",
                pathname === item.href 
                  ? "bg-blue-100 text-blue-600" 
                  : "hover:bg-gray-100 text-gray-700"
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