'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

// Definição das roles e permissões
export enum UserRole {
  CEO = 'CEO',
  ADMIN = 'admin',
  ASSISTENTE = 'rh'
}

export enum Permission {
  // Usuários
  READ_USERS = 'read:users',
  CREATE_USERS = 'create:users',
  UPDATE_USERS = 'update:users',
  DELETE_USERS = 'delete:users',
  
  // Folha de pagamento
  READ_PAYROLL = 'read:payroll',
  CREATE_PAYROLL = 'create:payroll',
  UPDATE_PAYROLL = 'update:payroll',
  DELETE_PAYROLL = 'delete:payroll',
  
  // Documentos
  READ_DOCUMENTS = 'read:documents',
  CREATE_DOCUMENTS = 'create:documents',
  UPDATE_DOCUMENTS = 'update:documents',
  DELETE_DOCUMENTS = 'delete:documents',
  
  // Relatórios
  READ_REPORTS = 'read:reports',
  CREATE_REPORTS = 'create:reports'
}

// Mapeamento de roles para permissões
const rolePermissionsMap: Record<string, Permission[]> = {
  // CEO tem todas as permissões
  'CEO': Object.values(Permission),
  
  // Admin tem quase todas as permissões
  'admin': [
    Permission.READ_USERS, 
    Permission.CREATE_USERS, 
    Permission.UPDATE_USERS,
    Permission.READ_PAYROLL, 
    Permission.CREATE_PAYROLL, 
    Permission.UPDATE_PAYROLL,
    Permission.READ_DOCUMENTS, 
    Permission.CREATE_DOCUMENTS,
    Permission.READ_REPORTS, 
    Permission.CREATE_REPORTS
  ],
  
  // Assistente RH tem permissões limitadas
  'rh': [
    Permission.READ_USERS,
    Permission.READ_PAYROLL,
    Permission.READ_DOCUMENTS,
    Permission.READ_REPORTS
  ]
};

// Funções de verificação de permissão
export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role || !rolePermissionsMap[role]) {
    return false;
  }
  return rolePermissionsMap[role].includes(permission);
}

export function hasAllPermissions(role: string | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

// Tema
type Theme = "light" | "dark" | "system"

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

// Contexto de Permissões
interface PermissionsContextType {
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  userRole?: string;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}

// Componente PermissionsProvider
function PermissionsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(userRole, permission);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    return hasAllPermissions(userRole, permissions);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => checkPermission(permission));
  };

  return (
    <PermissionsContext.Provider value={{ 
      hasPermission: checkPermission, 
      hasAllPermissions: checkAllPermissions, 
      hasAnyPermission: checkAnyPermission,
      userRole 
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export default function Providers({ 
  children,
  defaultTheme = "system", 
  storageKey = "rh-theme"
}: { 
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string 
}) {
  const [theme, setTheme] = useState<Theme>("system")
  
  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme(defaultTheme)
    }
  }, [defaultTheme, storageKey])

  // Update class on theme change
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove previous class
    root.classList.remove("light", "dark")

    // Add appropriate class based on theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      <SessionProvider>
        <PermissionsProvider>
          {children}
        </PermissionsProvider>
      </SessionProvider>
    </ThemeProviderContext.Provider>
  )
}