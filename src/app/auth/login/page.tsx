'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password
            })

            if (result?.error) {
                setError('Credenciais inválidas')
            } else {
                router.push('/dashboard') // Redireciona após login bem-sucedido
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error)
            setError('Ocorreu um erro ao tentar fazer login')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-100 text-red-600 p-3 rounded">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block mb-2">E-mail</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2">Senha</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Entrar
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}