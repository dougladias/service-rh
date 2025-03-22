// src/components/ui/RoleGuard.tsx
'use client'

import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { UserRole } from '@/components/layout/sidebar' 

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null
}: RoleGuardProps) {
  const { data: session } = useSession()
  const userRole = session?.user?.role as string | undefined
  
  // Função para verificar se o usuário tem a role permitida
  const hasAccess = () => {
    if (!userRole) return false
    
    // Converte a role para enum, se necessário
    let role: UserRole;
    if (userRole === 'CEO') {
      role = UserRole.CEO;
    } else if (userRole === 'admin') {
      role = UserRole.ADMIN;
    } else if (userRole === 'rh') {
      role = UserRole.ASSISTENTE;
    } else {
      // Role desconhecida
      return false;
    }
    
    return allowedRoles.includes(role)
  }
  
  if (!hasAccess()) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}