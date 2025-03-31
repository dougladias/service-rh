'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  DownloadCloud,
  Printer,
  Search,
  Plus,
  ArrowLeft,
  Eye,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

// Interface para o tipo de Holerite alinhada com o backend
interface Holerite {
  _id: string;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  totalSalary: number;
  status: 'pending' | 'processed' | 'paid';
  contract: 'CLT' | 'PJ';
  employeeId: string;
  deductions: number;
  overtimePay?: number;
}

const months = [
  { value: '1/2025', label: 'Janeiro/2025' },
  { value: '2/2025', label: 'Fevereiro/2025' },
  { value: '3/2025', label: 'Março/2025' },
  { value: '4/2025', label: 'Abril/2025' },
  { value: '5/2025', label: 'Maio/2025' },
  { value: '6/2025', label: 'Junho/2025' },
  { value: '7/2025', label: 'Julho/2025' },
  { value: '8/2025', label: 'Agosto/2025' },
  { value: '9/2025', label: 'Setembro/2025' },
  { value: '10/2025', label: 'Outubro/2025' },
  { value: '11/2025', label: 'Novembro/2025' },
  { value: '12/2025', label: 'Dezembro/2025' }  
]

export default function HoleritesPage() {
  const [selectedMonth, setSelectedMonth] = useState('1/2025')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewHolerite, setViewHolerite] = useState(false)
  const [selectedHolerite, setSelectedHolerite] = useState<Holerite | null>(null)
  const [holerites, setHolerites] = useState<Holerite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Carregar holerites ao mudar o mês
  useEffect(() => {
    const fetchHolerites = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [month, year] = selectedMonth.split('/')
        const response = await axios.get('/api/payroll', {
          params: { month, year }
        })
        
        setHolerites(response.data.payrolls || [])
      } catch (err) {
        console.error('Erro ao buscar holerites:', err)
        setError('Não foi possível carregar os holerites')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHolerites()
  }, [selectedMonth])

  // Filtrar holerites com base no termo de busca
  const filteredHolerites = holerites.filter(holerite => 
    holerite.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Visualizar holerite
  const handleViewHolerite = (holerite: Holerite) => {
    setSelectedHolerite(holerite)
    setViewHolerite(true)
  }

  // Gerar holerites
  const handleGenerateHolerite = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const [month, year] = selectedMonth.split('/')
      const response = await axios.post('/api/payroll/process', { 
        month: parseInt(month), 
        year: parseInt(year) 
      })
      
      setHolerites(response.data.payrolls || [])
    } catch (err) {
      console.error('Erro ao gerar holerites:', err)
      setError('Não foi possível gerar os holerites')
    } finally {
      setIsGenerating(false)
    }
  }

  // Baixar ou visualizar holerite
  const handleDownloadHolerite = async (id: string) => {
    setIsDownloading(true)
    try {
      // Abrir em uma nova janela para visualizar o holerite
      window.open(`/api/payroll/holerite/${id}`, '_blank')
    } catch (err) {
      console.error('Erro ao baixar holerite:', err)
      setError('Não foi possível baixar o holerite')
    } finally {
      setIsDownloading(false)
    }
  }

  // Determinar status do holerite
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'processed': return 'Gerado'
      case 'pending': return 'Pendente'
      case 'paid': return 'Pago'
      default: return status
    }
  }

  // Determinar classe de status
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'processed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/dashboard/folha-pagamento">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Holerites</h1>
          <p className="text-muted-foreground">Geração e visualização de holerites dos funcionários</p>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          {error}
        </div>
      )}

      {/* Filtros e Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="w-full md:w-60">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar funcionário..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateHolerite} 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Gerar Holerites
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabela de Holerites */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Mês/Ano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Salário Líquido</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Carregando holerites...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredHolerites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhum holerite encontrado para o período selecionado
                </TableCell>
              </TableRow>
            ) : (
              filteredHolerites.map((holerite) => (
                <TableRow key={holerite._id}>
                  <TableCell className="font-medium">{holerite.employeeName}</TableCell>
                  <TableCell>{`${holerite.month}/${holerite.year}`}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(holerite.status)}`}>
                      {getStatusLabel(holerite.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {holerite.totalSalary.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewHolerite(holerite)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadHolerite(holerite._id)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <DownloadCloud className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para visualização do holerite */}
      {selectedHolerite && (
        <Dialog open={viewHolerite} onOpenChange={setViewHolerite}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Holerite - {selectedHolerite.employeeName}</DialogTitle>
              <DialogDescription>
                Referente a {`${selectedHolerite.month}/${selectedHolerite.year}`}
              </DialogDescription>
            </DialogHeader>
            
            <div>
              {/* Renderiza o holerite em um iframe para mostrar o HTML completo */}
              <iframe 
                src={`/api/payroll/holerite/${selectedHolerite._id}`} 
                className="w-full h-[600px] border" 
                title="Detalhes do Holerite"
              />
            </div>
            
            <DialogFooter className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => handleDownloadHolerite(selectedHolerite._id)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DownloadCloud className="mr-2 h-4 w-4" />
                )}
                Baixar PDF
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button onClick={() => setViewHolerite(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}