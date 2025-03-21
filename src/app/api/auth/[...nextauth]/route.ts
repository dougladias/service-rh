

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Configuração do NextAuth
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Lógica de autenticação
        if (
          credentials?.email === "admin@rhcontrol.com" && 
          credentials?.password === "admin123"
        ) {
          return { 
            id: "1", 
            email: credentials.email,
            name: "Administrador",
            role: "admin"
          }
        }
        return null
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
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    // Adiciona id e email ao objeto de sessão
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }