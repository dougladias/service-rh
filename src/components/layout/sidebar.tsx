'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

import {
  LayoutDashboard,
  Users,
  FileText,   
  Clock,
  ChevronDown,
  ChevronRight,
  FileUser,  
  FilePlus,
  FileMinus,
  Landmark,
  Banknote,
  Gift,
  ReceiptText,
  Cog,
  CircleUser,
  BriefcaseBusiness
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Importação dinâmica do Lottie para evitar problemas de SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Importe seu arquivo JSON do Lottie
import LogoGloboo from '../../../public/logo-g.json'

// Definição de roles do sistema
export enum UserRole {
  CEO = 'CEO',
  ADMIN = 'administrador',
  ASSISTENTE = 'assistente'
}

// Define interface for menu items
interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  allowedRoles?: UserRole[]; // Roles que podem acessar este item
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard'
    // Não definimos roles = acessível a todos
  },
  {
    icon: Users,
    label: 'Funcionários',
    href: '/dashboard/funcionarios',
    allowedRoles: [UserRole.CEO, UserRole.ADMIN],
  },
  {
    icon: FileUser,
    label: 'Documentos',
    href: '/dashboard/documentos',
    allowedRoles: [UserRole.CEO, UserRole.ADMIN],
    subItems: [
      {
        icon: FilePlus,
        label: 'File Documentos',
        href: '/dashboard/documentos',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN]
      },
      {
        icon: FileMinus,
        label: 'Modelos',
        href: '/dashboard/documentos/modelos',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN]
      }
    ]
  },
  {
    icon: Landmark,
    label: 'Folha Salarial',
    href: '/dashboard/folha-pagamento',
    allowedRoles: [UserRole.CEO, UserRole.ADMIN],
    subItems: [
      {
        icon: Banknote,
        label: 'Pagamentos',
        href: '/dashboard/folha-pagamento',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN]
      },
      {
        icon: Gift,
        label: 'Benefícios',
        href: '/dashboard/folha-pagamento/beneficios',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN]
      },
      {
        icon: ReceiptText,
        label: 'Holerites',
        href: '/dashboard/folha-pagamento/holerites',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN]
      },     
      {
        icon: FileText,
        label: 'Relatorios',
        href: '/dashboard/folha-pagamento/relatorios',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN]
      }
    ]
  },
  {
    icon: FileText,
    label: 'Lista de Tarefas',
    href: '/dashboard/lista-tarefas',
    allowedRoles: [UserRole.ASSISTENTE],
  },
  {
    icon: FileText,
    label: 'Relatórios',
    href: '/dashboard/relatorios',
    allowedRoles: [UserRole.CEO, UserRole.ADMIN]
  },
  {
    icon: Cog,
    label: 'Controle',
    href: '/dashboard/controle-ponto',
    allowedRoles: [UserRole.CEO, UserRole.ADMIN, UserRole.ASSISTENTE],
    subItems: [
      {
        icon: Clock,
        label: 'Controle de Ponto',
        href: '/dashboard/controle-ponto',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN, UserRole.ASSISTENTE]
      },
      {
        icon: CircleUser,
        label: 'Visitantes',
        href: '/dashboard/visitantes',
        allowedRoles: [UserRole.CEO, UserRole.ASSISTENTE]
      },
      {
        icon: BriefcaseBusiness,
        label: 'Prestadores de Serviço',
        href: '/dashboard/prestadores',
        allowedRoles: [UserRole.CEO, UserRole.ASSISTENTE]
      }
    ]
  }  
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const { data: session } = useSession()

  // Pega a role do usuário da sessão
  const userRole = session?.user?.role as UserRole | undefined

  // Função para verificar se o usuário tem acesso a um item do menu
  const hasAccess = useCallback((item: MenuItem) => {
    // Se não há roles definidas, o item é sempre acessível
    if (!item.allowedRoles || item.allowedRoles.length === 0) return true;

    // Se o usuário não tem role, não tem acesso
    if (!userRole) return false;

    // Converte a role para enum, se necessário
    let role: UserRole;
    if (userRole === 'CEO') {
      role = UserRole.CEO;
    } else if (userRole === 'administrador') {
      role = UserRole.ADMIN;
    } else if (userRole === 'assistente') {
      role = UserRole.ASSISTENTE;
    } else {
      // Role desconhecida
      return false;
    }

    // Verifica se a role do usuário está nas roles permitidas
    return item.allowedRoles.includes(role);
  }, [userRole]);

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

  // Filtra os itens do menu com base nas permissões do usuário
  const getFilteredMenuItems = useCallback((items: MenuItem[]) => {
    return items.filter(item => hasAccess(item));
  }, [hasAccess]);

  // Filtra os subitens com base nas permissões
  const getFilteredSubItems = useCallback((item: MenuItem) => {
    if (!item.subItems) return [];
    return getFilteredMenuItems(item.subItems);
  }, [getFilteredMenuItems]);

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

  // Filtra os itens do menu com base nas permissões
  const filteredMenuItems = getFilteredMenuItems(menuItems);

  // Determina o título do tipo de usuário para exibir
  const userTypeTitle = () => {
    if (!userRole) return "Usuário";

    switch (userRole) {
      case "CEO":
        return "CEO";
      case "administrador":
        return "Administrador";
      case "assistente":
        return "Assistente";
      default:
        return "Usuário";
    }
  };

  return (
    <aside className="fixed left-0 bt-black h-full w-64 bg-gray-100 dark:bg-gray-800 border-r shadow-sm z-40">
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
        <h1 className="text-1xl uppercase font-bold mb-10 text-center text-black dark:text-cyan-300 mt-4">
          {userTypeTitle()}
        </h1>
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            // Filtra subitens com base nas permissões
            const filteredSubItems = getFilteredSubItems(item);

            // Se não há subitens visíveis, não mostrar o submenu
            const hasVisibleSubItems = filteredSubItems.length > 0;

            return (
              <div key={item.href}>
                {item.subItems && hasVisibleSubItems ? (
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

                {item.subItems && hasVisibleSubItems && expandedMenu === item.label && (
                  <div className="pl-6 mt-1 space-y-1">
                    {filteredSubItems.map((subItem) => (
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
            );
          })}
        </nav>
      </div>
    </aside>
  )
}