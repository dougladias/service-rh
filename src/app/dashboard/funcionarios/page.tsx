'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { IWorker } from '@/models/Worker'
import {  
  Edit, 
  Trash2,
  Search,
  Eye,
  EyeOff,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import EditWorkerModal from '@/components/ui/EditWorkModal'
import AddWorkerModal from '@/components/ui/AddWorkerModal'
import { ButtonGlitchBrightness } from '@/components/ui/ButtonGlitch'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
}

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
}

export default function EmployeesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleSalaries, setVisibleSalaries] = useState<Record<string, boolean>>({})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<IWorker | null>(null)
  const [animateIcons, setAnimateIcons] = useState(false)

  // Trigger icon animations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateIcons(true)
      setTimeout(() => setAnimateIcons(false), 1000)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Data fetching
  const {
    data: workers = [],
    isLoading,
    error,
  } = useQuery<IWorker[]>({
    queryKey: ['workers'],
    queryFn: async () => {
      const response = await axios.get('/api/workers')
      return response.data.map((worker: IWorker) => ({
        ...worker,
        nascimento: new Date(worker.nascimento),
        admissao: new Date(worker.admissao),
      }))
    },
    staleTime: 5000,
  })

  // Delete worker mutation
  const deleteWorker = useMutation({
    mutationFn: (workerId: string) =>
      axios.delete('/api/workers', { data: { id: workerId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
    onError: (err) => {
      console.error('Failed to delete worker', err)
      alert('Failed to delete worker')
    },
  })

  // Update worker details mutation
  const updateWorkerDetails = useMutation({
    mutationFn: ({
      workerId,
      updates,
    }: {
      workerId: string
      updates: Partial<IWorker>
    }) => axios.put('/api/workers', { id: workerId, updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      setIsEditModalOpen(false)
    },
    onError: (err) => {
      console.error('Failed to update worker details', err)
      alert('Failed to update worker details')
    },
  })

  // Basic search filtering
  const filteredWorkers = workers.filter(worker => {
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      worker.name?.toLowerCase().includes(searchLower) ||
      worker.email?.toLowerCase().includes(searchLower) ||
      worker.role?.toLowerCase().includes(searchLower)
    )
  })

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }
  
  // Format currency without limiting decimals
  const formatSalary = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  
  // Toggle salary visibility
  const toggleSalaryVisibility = (workerId: string) => {
    setVisibleSalaries(prev => ({
      ...prev,
      [workerId]: !prev[workerId]
    }))
  }

  // Handlers
  const handleDelete = (workerId: string) => {
    if (confirm('Tem certeza que quer deletar esse funcionário?')) {
      deleteWorker.mutate(workerId)
    }
  }

  const handleEdit = (workerId: string) => {
    const worker = workers.find((w) => w._id === workerId)
    if (worker) {
      setSelectedWorker(worker)
      setIsEditModalOpen(true)
    }
  }

  const handleSave = (updatedWorker: {
    _id: string
    name: string
    cpf: string
    nascimento: string
    admissao: string
    salario: string
    numero: string
    email: string
    address: string
    contract: string
    role: string
  }) => {
    // Convert the simplified worker to IWorker format for the mutation
    const workerToUpdate: Partial<IWorker> = {
      ...updatedWorker,
      nascimento: new Date(updatedWorker.nascimento),
      admissao: new Date(updatedWorker.admissao),
    }

    updateWorkerDetails.mutate({
      workerId: updatedWorker._id,
      updates: workerToUpdate,
    })
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedWorker(null)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
  }

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header with Page Title and Actions */}
      <div className="flex justify-between items-center">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <motion.div
              animate={animateIcons ? 
                { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : 
                { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.5 }}
            >
              <Users className="h-6 w-6 text-cyan-500" />
            </motion.div>
            Funcionários
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Gerenciamento de funcionários</p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          {/* Animated Search Bar */}
          <motion.div 
            className="relative"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <motion.div
                animate={{ rotate: searchTerm ? [0, -10, 10, -10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Search size={18} className="text-gray-400" />
              </motion.div>
            </div>
            <motion.input
              type="text"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block pl-10 p-2.5 transition-all duration-200 focus:w-64 w-48"
              placeholder="Buscar funcionário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              whileFocus={{ width: "16rem" }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Animated Add Employee Button */}
            <motion.div variants={itemVariants}>
            <ButtonGlitchBrightness
              text="Adicionar novo Funcionário"
              onClick={() => setIsAddModalOpen(true)}
              type="submit"
              disabled={isLoading}
              className="px-4 py-2"
            />
            </motion.div>
        </div>
      </div>

      {/* Employee Count Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de funcionários</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                {filteredWorkers.length}
              </motion.span>
            </h3>
          </div>
          <motion.div
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.1, 1, 1.1, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 5
            }}
            className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-full"
          >
            <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          </motion.div>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <motion.div 
              className="bg-cyan-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <motion.div 
          className="py-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col items-center justify-center">
            <motion.div
              className="w-12 h-12 mb-3 border-4 border-gray-200 dark:border-gray-700 rounded-full"
              style={{ borderTopColor: "#22d3ee" }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.span
              className="text-cyan-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Carregando funcionários...
            </motion.span>
          </div>
        </motion.div>
      ) : error ? (
        <motion.div 
          className="py-4 text-center text-red-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, 0, -2, 0] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            ⚠️
          </motion.div> Erro ao carregar funcionários
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Salário</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {searchTerm 
                        ? "Nenhum funcionário encontrado com esse termo de busca." 
                        : "Nenhum funcionário cadastrado."}
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredWorkers.map((worker, index) => (
                    <motion.tr
                      key={worker._id as React.Key || `worker-${index}`}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                      custom={index}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      whileHover={{ 
                        backgroundColor: "rgba(0, 0, 0, 0.03)",
                        transition: { duration: 0.1 }
                      }}
                    >
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>{worker.role}</TableCell>
                      <TableCell>{worker.email}</TableCell>
                      <TableCell className="relative">
                        <div className="flex items-center space-x-2">
                          <motion.span 
                            className={visibleSalaries[worker._id as string] ? "" : "filter blur-md select-none"}
                            animate={
                              visibleSalaries[worker._id as string] 
                                ? { scale: [1.05, 1], color: ["#10b981", "#374151"] } 
                                : {}
                            }
                            transition={{ duration: 0.3 }}
                          >
                            {worker.salario ? 
                              formatSalary(parseFloat(worker.salario)) : 
                              '-'}
                          </motion.span>
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => toggleSalaryVisibility(worker._id as string)}
                            >
                              {visibleSalaries[worker._id as string] ? 
                                <EyeOff size={16} className="text-gray-500" /> : 
                                <Eye size={16} className="text-gray-500" />}
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(worker.admissao)}</TableCell>
                      <TableCell>
                        <motion.span 
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            worker.status === 'inactive' 
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          animate={
                            worker.status !== 'inactive' 
                              ? { y: [0, -2, 0], transition: { repeat: Infinity, repeatDelay: 3 } } 
                              : {}
                          }
                        >
                          {worker.status === 'inactive' ? 'Inativo' : 'Ativo'}
                        </motion.span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEdit(worker._id as string)}
                            >
                              <Edit size={16} />
                            </Button>
                          </motion.div>
                          <motion.div 
                            whileHover={{ scale: 1.1, opacity: 1 }} 
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 1 }}
                          >
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleDelete(worker._id as string)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isEditModalOpen && selectedWorker && (
          <EditWorkerModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            worker={{
              ...selectedWorker,
              _id: selectedWorker._id as string,
              nascimento: selectedWorker.nascimento.toISOString().split("T")[0],
              admissao: selectedWorker.admissao.toISOString().split("T")[0],
              ajuda: selectedWorker.ajuda || '', // Provide default empty string for ajuda
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddWorkerModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}