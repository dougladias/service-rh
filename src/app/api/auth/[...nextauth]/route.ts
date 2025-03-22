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
        // Usuários usando variáveis de ambiente
        const users = [
          {
            id: "1",
            email: process.env.CEO_EMAIL,
            password: process.env.CEO_PASSWORD,
            name: process.env.CEO_NAME,
            role: "CEO"
          },
          {
            id: "2",
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            name: process.env.ADMIN_NAME,
            role: "administrador" 
          },
          {
            id: "3",
            email: process.env.ASSISTENTE_EMAIL,
            password: process.env.ASSISTENTE_PASSWORD,
            name: process.env.ASSISTENTE_NAME,
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
          const { ...userWithoutPassword } = user;
          return userWithoutPassword as CustomUser;
        }
        
        return null;
      }
    })
  ],
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