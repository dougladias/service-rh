
'use client'

import { signOut } from 'next-auth/react'
import { Bell, User, ChevronDown } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'

export default function Topbar() {
    const router = useRouter()

    const handleLogout = async () => {
        await signOut({ 
            redirect: false 
        })
        router.push('/auth/login')
    }

    return (
        <header className="sticky top-0 z-50 bg-gray-100 dark:bg-gray-800 border-b shadow-sm h-16 flex items-center justify-between px-6">
            <div className="text-gray-700 dark:text-gray-300 text-[0.9rem] font-medium">
                Bem-vindo de volta! Hoje é <span className="text-cyan-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                
            </div>
            <div className="flex items-center space-x-4">
    <div className="relative">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer">
                    <Bell className="text-gray-600 dark:text-gray-300" size={20} />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        2
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem className="p-3 cursor-default">
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">Nova solicitação de férias</span>
                            <span className="text-xs text-gray-500">João Silva solicitou aprovação de férias</span>
                            <span className="text-xs text-gray-400 mt-1">Há 20 minutos</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="p-3 cursor-default opacity-70">
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">Lembrete de avaliação</span>
                            <span className="text-xs text-gray-500">Avaliação de desempenho trimestral pendente</span>
                            <span className="text-xs text-gray-400 mt-1">Ontem</span>
                        </div>
                    </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-blue-600 font-medium">
                    Ver todas as notificações
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <div className="fixed -translate-x-[3rem] top-[0.85rem]">
            <ThemeToggle />
        </div>
    </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2">
                            <User className="bg-gray-200 rounded-full p-1" size={32} />
                            <span className="text-sm font-medium">Admin</span>
                            <ChevronDown size={16} className="text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Configurações</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-red-600" 
                            onSelect={handleLogout}
                        >
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}