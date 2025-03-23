'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
// Use dynamic import for Lottie
import dynamic from 'next/dynamic'

// Dynamically import Lottie with SSR disabled to avoid "document is not defined" error
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    interface LottieAnimationData {
        v: string;
        fr: number;
        ip: number;
        op: number;
        w: number;
        h: number;
        nm: string;
        ddd: number;
        assets: Array<Record<string, unknown>>;
        layers: Array<Record<string, unknown>>;
        [key: string]: unknown;
    }
    
    const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null)
    const [isClient, setIsClient] = useState(false)

    // Set isClient to true on component mount
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Use fetch instead of import to load the animation data (only on client)
    useEffect(() => {
        if (isClient) {
            fetch('/logo-g.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch animation data');
                    }
                    return response.json();
                })
                .then(data => {
                    setAnimationData(data);
                })
                .catch(error => {
                    console.error("Error loading animation:", error);
                });
        }
    }, [isClient]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password
            })

            if (result?.error) {
                setError('Credenciais inválidas')
                setIsLoading(false)
            } else {
                router.push('/dashboard') // Redireciona após login bem-sucedido
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error)
            setError('Ocorreu um erro ao tentar fazer login')
            setIsLoading(false)
        }
    }

    // Variants for container animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            }
        }
    }

    // Variants for child elements
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: 'spring', stiffness: 300, damping: 24 }
        }
    }

    // Logo animation variants
    const logoVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { 
            scale: 1, 
            opacity: 1,
            transition: { 
                type: 'spring',
                stiffness: 300,
                delay: 0.2
            }
        }
    }

    // Button hover animation
    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.03, transition: { duration: 0.2 } },
        tap: { scale: 0.97 }
    }

    // Error message animation
    const errorVariants = {
        hidden: { opacity: 0, y: -10, height: 0 },
        visible: { 
            opacity: 1, 
            y: 0,
            height: 'auto',
            transition: { type: 'spring', stiffness: 500, damping: 30 }
        },
        exit: { 
            opacity: 0,
            y: -10,
            height: 0,
            transition: { duration: 0.2 }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-md"
            >
                <motion.div
                    variants={logoVariants}
                    className="flex justify-center mb-8"
                >
                    <div className="flex items-center justify-center">
                        {isClient && animationData ? (
                            <Lottie 
                                animationData={animationData} 
                                loop={true}
                                style={{ width: '150px', height: '150px' }}
                                className="shadow-lg rounded-full"
                            />
                        ) : (
                            // Fallback while animation loads
                            <motion.div 
                                className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center"
                                animate={{ opacity: [0.6, 1, 0.6] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <span className="text-white text-2xl font-bold">G</span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bem-vindo ao Sistema Globoo.</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Faça login para acessar o painel</p>
                </motion.div>

                <Card className="shadow-xl border-none bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                    <CardContent className="pt-6">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        variants={errorVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-lg border border-red-200 dark:border-red-800"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="email" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">E-mail</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-gray-50 dark:bg-gray-700"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="password" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Senha</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 bg-gray-50 dark:bg-gray-700"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                                        >
                                            {showPassword ? 
                                                <EyeOff className="w-5 h-5" /> : 
                                                <Eye className="w-5 h-5" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex justify-end">
                                <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                    Esqueceu a senha?
                                </a>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <motion.div
                                    variants={buttonVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <Button 
                                        type="submit" 
                                        className="w-full bg-cyan-400 hover:bg-cyan-500 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                                />
                                                Autenticando...
                                            </>
                                        ) : (
                                            'Entrar'
                                        )}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>

                <motion.p 
                    variants={itemVariants}
                    className="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm"
                >
                    © {new Date().getFullYear()} Globoo.io Todos os direitos reservados.
                </motion.p>
            </motion.div>
        </div>
    )
}