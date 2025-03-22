

'use client'

import { useSession } from 'next-auth/react'
import { Permission, UserRole } from '@/types/permissions'
import { hasPermission, hasAllPermissions, hasAnyPermission } from '@/lib/auth'

// Retorna as permissões do usuário atual
export function usePermissions() {
  const { data: session } = useSession()
  const userRole = session?.user?.role as UserRole | undefined
  
  return {
    // Retorna o papel do usuário atual
    role: userRole,
    
    // Verifica se o usuário tem um papel específico
    isRole: (role: UserRole): boolean => {
      return userRole === role
    },
    
    // Verifica se o usuário tem uma permissão específica
    hasPermission: (permission: Permission): boolean => {
      return userRole ? hasPermission(userRole, permission) : false
    },
    
    // Verifica se o usuário tem todas as permissões especificadas
    hasAllPermissions: (permissions: Permission[]): boolean => {
      return userRole ? hasAllPermissions(userRole, permissions) : false
    },
    
    // Verifica se o usuário tem pelo menos uma das permissões
    hasAnyPermission: (permissions: Permission[]): boolean => {
      return userRole ? hasAnyPermission(userRole, permissions) : false
    }
  }
}