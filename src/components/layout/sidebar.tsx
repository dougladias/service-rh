'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'

import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  Clock,
  ChevronDown,
  ChevronRight 
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Importação dinâmica do Lottie para evitar problemas de SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Importe seu arquivo JSON do Lottie
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
    label: 'Documentos', 
    href: '/dashboard/documentos',
    subItems: [
      { 
        icon: FileText, 
        label: 'File Documentos', 
        href: '/dashboard/documentos' 
      },
      { 
        icon: FileText, 
        label: 'Modelos', 
        href: '/dashboard/documentos/modelos' 
      }     
    ] 
  },
  { 
    icon: FileText, 
    label: 'Folha Salarial', 
    href: '/dashboard/folha-pagamento',
    subItems: [
      { 
        icon: FileText, 
        label: 'Pagamentos', 
        href: '/dashboard/folha-pagamento' 
      },
      { 
        icon: FileText, 
        label: 'Benefícios', 
        href: '/dashboard/folha-pagamento/beneficios' 
      },
      { 
        icon: FileText, 
        label: 'Holerites', 
        href: '/dashboard/folha-pagamento/holerites' 
      },
      { 
        icon: FileText, 
        label: 'Calculo', 
        href: '/dashboard/folha-pagamento/calculo' 
      },
      { 
        icon: FileText, 
        label: 'Relatorios', 
        href: '/dashboard/folha-pagamento/relatorios' 
      }    
    ] 
  },
  { 
    icon: FileText, 
    label: 'Relatórios', 
    href: '/dashboard/relatorios' 
  },
  { 
    icon: Clock, 
    label: 'Controle', 
    href: '/dashboard/controle-ponto',
    subItems: [
      { 
        icon: Clock, 
        label: 'Controle de Ponto', 
        href: '/dashboard/controle-ponto' 
      },
      {
        icon: Users,
        label: 'Visitantes',
        href: '/dashboard/visitantes'
      },
      {
        icon: Users,
        label: 'Prestadores de Serviço',
        href: '/dashboard/prestadores'
      }
    ]
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
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  // Define interface for menu items
  interface MenuItem {
    icon: React.ElementType;
    label: string;
    href: string;
    subItems?: MenuItem[];
  }

  // Função para verificar se um item pai deve estar ativo com base na rota atual
  const isActiveParent = useCallback((currentPath: string | null, item: MenuItem) => {
    if (!currentPath) return false
    
    if (currentPath === item.href) return true
    
    if (item.subItems) {
      return item.subItems.some((subItem) => 
        currentPath === subItem.href || 
        currentPath.startsWith(`${subItem.href}/`)
      )
    }
    
    return false
  }, [])

  // Renderiza o Lottie apenas após o componente ser montado no cliente
  useEffect(() => {
    setIsMounted(true)
    
    // Expande automaticamente o menu que contém a rota atual
    menuItems.forEach(item => {
      if (item.subItems && isActiveParent(pathname, item)) {
        setExpandedMenu(item.label)
      }
    })
  }, [pathname, isActiveParent])

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  return (
    <aside className="fixed left-0 bt-black h-full w-64 bg-gray-300 dark:bg-gray-800 border-r shadow-sm z-40">
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
        <h1 className="text-1xl uppercase font-bold mb-10 text-center text-black dark:text-cyan-300 mt-4">Administrador</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.href}>
              {item.subItems ? (
                // Item com submenu
                <div 
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors duration-200 cursor-pointer",
                    isActiveParent(pathname, item)
                      ? "bg-black text-cyan-300" 
                      : "hover:bg-gray-400 text-gray-800 dark:text-white"
                  )}
                  onClick={() => toggleSubmenu(item.label)}
                >
                  <item.icon className="mr-3" size={20} />
                  <div className="flex-1 flex justify-between items-center">
                    {item.label}
                    {expandedMenu === item.label ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>
              ) : (
                // Item sem submenu - usando Link para navegação
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors duration-200",
                    pathname === item.href 
                      ? "bg-black text-cyan-300" 
                      : "hover:bg-gray-400 text-gray-800 dark:text-white"
                  )}
                >
                  <item.icon className="mr-3" size={20} />
                  <div className="flex-1">
                    {item.label}
                  </div>
                </Link>
              )}
              
              {item.subItems && expandedMenu === item.label && (
                <div className="pl-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "flex items-center p-2 rounded-lg text-sm transition-colors duration-200",
                        pathname === subItem.href 
                          ? "bg-black text-cyan-300" 
                          : "hover:bg-gray-400 text-gray-800 dark:text-gray-300"
                      )}
                    >
                      <subItem.icon className="mr-2" size={16} />
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}