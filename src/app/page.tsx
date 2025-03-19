
import { redirect } from 'next/navigation'

// Redireciona para a página de login
export default function Home() {
  redirect('/auth/login')
}