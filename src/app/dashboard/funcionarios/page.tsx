'use client'

import { useState } from 'react'
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
  EyeOff 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import EditWorkerModal from '@/components/ui/EditWorkModal'
import AddWorkerModal from '@/components/ui/AddWorkerModal'
import { ButtonGlitchBrightness } from '@/components/ui/ButtonGlitch'

export default function EmployeesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleSalaries, setVisibleSalaries] = useState<Record<string, boolean>>({})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<IWorker | null>(null)

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Funcionários</h1>
          <p className="text-gray-600">Gerenciamento de funcionários</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block pl-10 p-2.5 transition-all duration-200 focus:w-64 w-48"
              placeholder="Buscar funcionário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ButtonGlitchBrightness
            text="Adicionar novo Funcionário"
            onClick={() => setIsAddModalOpen(true)}
            type="submit"
            disabled={isLoading}
            className="px-4 py-2"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="flex flex-col items-center justify-center">
            <motion.div
              className="w-12 h-12 mb-3 border-4 border-gray-200 rounded-full"
              style={{ borderTopColor: "#22d3ee" }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.span
              className="text-cyan-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Carregando funcionários...
            </motion.span>
          </div>
        </div>
      ) : error ? (
        <div className="py-4 text-center text-red-500">
          Erro ao carregar funcionários
        </div>
      ) : (
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
                  {searchTerm 
                    ? "Nenhum funcionário encontrado com esse termo de busca." 
                    : "Nenhum funcionário cadastrado."}
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker._id as React.Key}>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>{worker.role}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell className="relative">
                      <div className="flex items-center space-x-2">
                        <span className={visibleSalaries[worker._id as string] ? "" : "filter blur-md select-none"}>
                          {worker.salario ? 
                            formatSalary(parseFloat(worker.salario)) : 
                            '-'}
                        </span>
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
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(worker.admissao)}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        worker.status === 'inactive' 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      )}>
                        {worker.status === 'inactive' ? 'Inativo' : 'Ativo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEdit(worker._id as string)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-600"
                          onClick={() => handleDelete(worker._id as string)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      )}

      {/* Modals */}
      {isEditModalOpen && selectedWorker && (
        <EditWorkerModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          worker={{
            ...selectedWorker,
            _id: selectedWorker._id as string,
            nascimento: selectedWorker.nascimento.toISOString().split("T")[0],
            admissao: selectedWorker.admissao.toISOString().split("T")[0],
          }}
          onSave={handleSave}
        />
      )}

      <AddWorkerModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} />
    </div>
  )
}