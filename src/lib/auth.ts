
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Função mock de validação - no futuro, será substituída por verificação no banco
const validateUser = async (email: string, password: string) => {

  // Usuários mock - no futuro, virão do banco de dados
  const users = [
    { 
      id: '1', 
      email: 'admin@rhcontrol.com', 
      password: 'admin123', 
      name: 'Administrador',
      role: 'admin'
    },
    { 
      id: '2', 
      email: 'rh@empresa.com', 
      password: 'rh123', 
      name: 'Usuário RH',
      role: 'rh'
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


// Estender o tipo Session para incluir id e role
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
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
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    // Adiciona id e role ao objeto de sessão
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string
          session.user.role = token.role as string
        }
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