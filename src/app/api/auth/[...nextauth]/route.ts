import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { User, UserRole } from "next-auth";

// Interface para o usuário retornado na autenticação
interface CustomUser extends User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Estender o tipo JWT para incluir role
declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

// Estender o tipo Session para incluir role
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      email: string;
      name: string;
      role: UserRole;
    }
  }
  type UserRole = string & {
    _brand?: 'UserRole';
  }
  interface User {
    role: UserRole;
  }
}

// Configuração do NextAuth
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        // Usuários mock para diferentes roles
        const users = [
          {
            id: "1",
            email: "ceo@globoo.io",
            password: "ceo123",
            name: "CEO",
            role: "CEO"
          },
          {
            id: "2",
            email: "admin@globoo.io",
            password: "admin123",
            name: "Administrador",
            role: "administrador"
          },
          {
            id: "3",
            email: "assistente@globoo.io",
            password: "assistente123",
            name: "Assistente",
            role: "assistente"
          }
        ];

        // Verifica credenciais
        const user = users.find(
          user => user.email === credentials?.email && 
                 user.password === credentials?.password
        );

        // Se encontrou um usuário, retorna os dados (menos a senha)
        if (user) {
          const { password, ...userWithoutPassword } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
          return userWithoutPassword as CustomUser;
        }
        
        // Não encontrou usuário, retorna null
        return null;
      }
    })
  ],
  // Página de login
  pages: {
    signIn: '/auth/login'
  },
  secret: process.env.NEXTAUTH_SECRET || "sua_chave_secreta_muito_longa_e_complexa_aqui",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Adiciona id e role ao objeto de sessão
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role as UserRole || "guest";
      }
      return session;
    }
  }
})

export { handler as GET, handler as POST }