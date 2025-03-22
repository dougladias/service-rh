import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { Permission, rolePermissions, UserRole } from '@/types/permissions'

// Define types for our user
interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

// Função mock de validação - no futuro, será substituída por verificação no banco
const validateUser = async (email: string, password: string): Promise<User | null> => {
  // Usuários mock - no futuro, virão do banco de dados
  const users = [
    { 
      id: '1', 
      email: 'ceo@globoo.io', 
      password: 'ceo123', 
      name: 'CEO',
      role: UserRole.CEO
    },
    { 
      id: '2', 
      email: 'admin@globoo.io', 
      password: 'admin123', 
      name: 'Administrador',
      role: UserRole.ADMIN
    },
    { 
      id: '3', 
      email: 'assistente@globo.io', 
      password: 'assistente123', 
      name: 'Assistente',
      role: UserRole.ASSISTENTE
    }
  ]

  // Busca usuário por e-mail e senha
  const user = users.find(u => u.email === email && u.password === password)
  return user ? { 
    id: user.id, 
    email: user.email, 
    name: user.name,
    role: user.role
  } : null
}

// Estender o tipo JWT para incluir role - already declared in route.ts

// Estender o tipo Session para incluir role
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string // Tornado opcional para corresponder à definição em route.ts
      email: string
      name: string
      role: UserRole
    }
  }
  
  interface User {
    id: string
    role: UserRole
    name?: string | null
    email?: string | null
  }
}

// Funções para verificar permissões
export function hasPermission(role: UserRole, permission: Permission): boolean {
  if (!rolePermissions[role]) {
    return false;
  }
  return rolePermissions[role].includes(permission);
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

// Configurações de autenticação
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Valida usuário
        const user = await validateUser(credentials.email, credentials.password)
        
        return user
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initialize role to a default value if not set
      if (!token.role) {
        token.role = UserRole.ASSISTENTE; // Default role
      }
      
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    // Adiciona id e role ao objeto de sessão
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role || UserRole.ASSISTENTE
      }
      // Retorna a sessão
      return session
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'sua_chave_secreta_muito_longa_e_complexa_aqui'
}