
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

export default function Topbar() {
    const router = useRouter()

    const handleLogout = async () => {
        await signOut({ 
            redirect: false 
        })
        router.push('/auth/login')
    }

    return (
        <header className="sticky top-0 z-50 bg-white border-b shadow-sm h-16 flex items-center justify-between px-6">
            <div className="text-gray-700 text-lg font-medium">
                Bem-vindo de volta, Admin! Hoje é {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Bell className="text-gray-600 cursor-pointer" size={20} />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        3
                    </span>
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