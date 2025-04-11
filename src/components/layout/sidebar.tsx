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
  Landmark,
  Banknote,
  Gift,
  ReceiptText,
  Cog,
  CircleUser,
  BriefcaseBusiness,  
  Codesandbox,
  File,
  Paperclip,  
  CalendarDays,
  ListTodo,
  CalendarCheck,
  StickyNote,
  BadgeDollarSign,
  Utensils,
  Menu,
  X
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
        icon: File,
        label: 'File Documentos',
        href: '/dashboard/documentos',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN]
      },
      {
        icon: Paperclip,
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
    label: 'Relatórios',
    href: '/dashboard/relatorios',
    allowedRoles: [UserRole.CEO, UserRole.ADMIN]
  },
  {
    icon: Cog,
    label: 'Controle',
    href: '/dashboard/controle',
    allowedRoles: [UserRole.CEO, UserRole.ADMIN, UserRole.ASSISTENTE],
    subItems: [
      {
        icon: Clock,
        label: 'Ponto',
        href: '/dashboard/controle-ponto',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN]
      },
      {
        icon: Utensils,
        label: 'Marmita',
        href: '/dashboard/controle/marmitas',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN,UserRole.ASSISTENTE]
      },
      {
        icon: StickyNote,
        label: 'Notas Fiscais',
        href: '/dashboard/controle/notas-fiscais',        
        allowedRoles: [UserRole.CEO, UserRole.ASSISTENTE]
      },
      {
        icon: BadgeDollarSign,
        label: 'Orçamentos',
        href: '/dashboard/controle/orcamentos',
                       
        allowedRoles: [UserRole.CEO, UserRole.ASSISTENTE]
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
      },
      {
        icon: Codesandbox,
        label: 'Materiais',
        href: '/dashboard/controle/materiais',
        allowedRoles: [UserRole.CEO, UserRole.ASSISTENTE]
      }
    ]
  },
  {
    icon: CalendarDays,
    label: 'Agenda',
    href: '/dashboard/agenda',
    allowedRoles: [UserRole.CEO, UserRole.ADMIN, UserRole.ASSISTENTE],
    subItems: [
      {
        icon: CalendarCheck,
        label: 'Agenda',
        href: '/dashboard/agenda',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN, UserRole.ASSISTENTE]
      },
      {
        icon: ListTodo,
        label: 'Lista de Tarefas',
        href: '/dashboard/lista-tarefas',
        allowedRoles: [UserRole.CEO, UserRole.ADMIN, UserRole.ASSISTENTE],
      },     
    ]
  }    
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const { data: session } = useSession()
  
  // Estado para controlar visibilidade da sidebar em telas pequenas
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Estado para armazenar o tamanho da tela
  const [screenWidth, setScreenWidth] = useState<number>(0)
  
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
    
    // Define o estado inicial da sidebar com base na largura da tela
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    // Inicializa com a largura atual
    handleResize()
    
    // Adiciona listener para redimensionamento
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [pathname, isActiveParent])

  // Fechar sidebar ao clicar em um link em telas pequenas
  const handleLinkClick = () => {
    if (screenWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
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
    <>
      {/* Botão de toggle da sidebar para telas pequenas */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-800 p-2 rounded-md text-white focus:outline-none"
        aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Overlay para fechar o menu ao clicar fora */}
      {sidebarOpen && screenWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-gray-100 dark:bg-gray-800 border-r shadow-sm z-40 transition-all duration-300 ease-in-out",
          sidebarOpen 
            ? "translate-x-0" 
            : "-translate-x-full lg:translate-x-0",
          screenWidth >= 1024 ? "w-64" : "w-72"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho do sidebar */}
          <div className="p-4 relative">
            {/* Botão de fechar para mobile dentro do sidebar */}
            <button
              onClick={toggleSidebar}
              className="absolute top-4 right-4 lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
            
            <div className="flex justify-center">
              {isMounted && (
                <Lottie
                  animationData={LogoGloboo}
                  style={{ 
                    width: screenWidth < 768 ? 120 : 160, 
                    height: screenWidth < 768 ? 120 : 160
                  }}
                  loop={true}
                  autoplay={true}
                />
              )}
            </div>
            <h1 className="text-xl uppercase font-bold mb-6 mt-2 text-center text-black dark:text-cyan-300">
              {userTypeTitle()}
            </h1>
          </div>
          
          {/* Menu de navegação com scroll */}
          <nav className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1">
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
                        "flex items-center p-2 rounded-lg transition-colors duration-200 cursor-pointer",
                        isActiveParent(pathname, item)
                          ? "bg-black text-cyan-300"
                          : "hover:bg-gray-400 text-gray-800 dark:text-white"
                      )}
                      onClick={() => toggleSubmenu(item.label)}
                    >
                      <item.icon className="mr-2 flex-shrink-0" size={18} />
                      <div className="flex-1 flex justify-between items-center text-sm md:text-base">
                        <span className="truncate">{item.label}</span>
                        {expandedMenu === item.label ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </div>
                  ) : (
                    // Item sem submenu - usando Link para navegação
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center p-2 rounded-lg transition-colors duration-200",
                        pathname === item.href
                          ? "bg-black text-cyan-300"
                          : "hover:bg-gray-400 text-gray-800 dark:text-white"
                      )}
                      onClick={handleLinkClick}
                    >
                      <item.icon className="mr-2 flex-shrink-0" size={18} />
                      <div className="flex-1 text-sm md:text-base">
                        <span className="truncate">{item.label}</span>
                      </div>
                    </Link>
                  )}

                  {item.subItems && hasVisibleSubItems && expandedMenu === item.label && (
                    <div className="pl-5 mt-1 space-y-1">
                      {filteredSubItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center p-2 rounded-lg text-xs md:text-sm transition-colors duration-200",
                            pathname === subItem.href
                              ? "bg-black text-cyan-300"
                              : "hover:bg-gray-400 text-gray-800 dark:text-gray-300"
                          )}
                          onClick={handleLinkClick}
                        >
                          <subItem.icon className="mr-2 flex-shrink-0" size={14} />
                          <span className="truncate">{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          
          {/* Rodapé do sidebar - opcional */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Sistema RH
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}