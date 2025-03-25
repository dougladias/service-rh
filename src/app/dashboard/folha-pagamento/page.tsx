'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { 
  FileText, 
  Download,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import axios from 'axios'

// Interface para a folha de pagamento
interface Payroll {
  _id: string
  employeeId: string
  employeeName: string
  contract: 'CLT' | 'PJ'
  month: number
  year: number
  baseSalary: number
  overtimePay: number
  overtimeHours: number
  deductions: number
  totalSalary: number
  inss?: number
  fgts?: number
  irrf?: number
  benefits?: {
    valeTransporte: number
    valeRefeicao: number
    planoSaude: number
  }
  status: 'pending' | 'processed' | 'paid'
  processedAt: string
}

// Função para formatar valores monetários
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1 + '')
  const [year, setYear] = useState(new Date().getFullYear() + '')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Função para mostrar mensagens de erro/sucesso
  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setErrorMessage(message);
      // Limpar após 5 segundos
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(message);
      // Limpar após 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Função para carregar as folhas de pagamento
  const loadPayrolls = useCallback(async () => {
    if (!month || !year) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log(`Carregando folhas para ${month}/${year}`);
      
      // Chamar o endpoint correto para buscar folhas existentes
      const response = await axios.get(`/api/payroll/process`, {
        params: { month, year },
        timeout: 10000 // 10 segundos de timeout
      });
      
      console.log('Folhas carregadas:', response.data);
      setPayrolls(response.data.payrolls || []);
      
      if (response.data.payrolls?.length === 0) {
        console.log('Nenhuma folha encontrada para o período');
      }
    } catch (error) {
      console.error('Erro ao carregar folhas:', error);
      
      // Tratar o erro adequadamente
      setPayrolls([]);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          showMessage('Tempo limite excedido ao carregar folhas. Tente novamente.', true);
        } else if (error.response?.status === 404) {
          // 404 é esperado quando não há folhas, não mostrar erro
          console.log('Nenhuma folha encontrada (404)');
        } else if (error.response?.status === 500) {
          showMessage('Erro no servidor ao carregar folhas. Contate o suporte.', true);
        } else {
          showMessage(`Erro ao carregar folhas: ${error.message}`, true);
        }
      } else {
        showMessage('Erro inesperado ao carregar folhas', true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  // Carregar folhas quando o filtro mudar
  useEffect(() => {
    loadPayrolls();
  }, [loadPayrolls]);

  // Função para processar a folha de pagamento
  const handleProcessPayroll = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      console.log(`Processando folha para ${month}/${year}`);
      
      const response = await axios.post('/api/payroll/process', {
        month: parseInt(month),
        year: parseInt(year)
      }, {
        timeout: 20000 // 20 segundos de timeout para processamento
      });

      console.log('Folha processada:', response.data);
      
      setPayrolls(response.data.payrolls || []);
      setIsDialogOpen(false);
      
      showMessage('Folha de pagamento processada com sucesso');
    } catch (error) {
      console.error('Erro ao processar folha:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          showMessage('Tempo limite excedido ao processar folha. O processamento pode ser demorado para muitos funcionários.', true);
        } else if (error.response?.status === 500) {
          const errorMsg = error.response.data?.error || 'Erro interno do servidor';
          showMessage(`Erro ao processar folha: ${errorMsg}`, true);
        } else {
          showMessage(`Erro ao processar folha: ${error.message}`, true);
        }
      } else {
        showMessage('Erro inesperado ao processar folha de pagamento', true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para baixar o holerite
  const handleDownloadPayslip = async (id: string) => {
    try {
      setDownloadingId(id);
      setErrorMessage(null);
      
      console.log(`Baixando holerite ID: ${id}`);
      
      // Abrir em uma nova janela para visualizar o holerite
      window.open(`/api/payroll/holerite/${id}`, '_blank');
      
    } catch (error) {
      console.error('Erro ao baixar holerite:', error);
      
      showMessage('Não foi possível baixar o holerite', true);
    } finally {
      // Pequeno delay antes de limpar o estado para feedback visual
      setTimeout(() => {
        setDownloadingId(null);
      }, 1000);
    }
  };

  // Função para obter o nome do mês
  const getMonthName = (monthNum: number): string => {
    const date = new Date(2000, monthNum - 1, 1);
    return date.toLocaleString('pt-BR', { month: 'long' });
  };

  return (
    <div className="p-6">
      {/* Mensagens de erro/sucesso */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Folha de Pagamento</CardTitle>
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Select 
                value={month}
                onValueChange={setMonth}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <SelectItem key={m} value={m.toString()}>
                      {getMonthName(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={year}
                onValueChange={setYear}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map(y => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="mr-2 h-4 w-4" /> 
                  Processar Folha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Processar Folha de Pagamento</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    Você está prestes a processar a folha de pagamento para:
                    <strong> {getMonthName(parseInt(month))} de {year}</strong>
                  </p>
                  <p className="text-amber-600 mt-4">
                    Atenção: Isso irá substituir qualquer folha existente para este período.
                  </p>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleProcessPayroll}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Confirmar'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Salário Base</TableHead>
                  <TableHead>Descontos</TableHead>
                  <TableHead>Líquido</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                        <span>Carregando...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payrolls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Nenhuma folha processada para o período selecionado
                    </TableCell>
                  </TableRow>
                ) : (
                  payrolls.map((payroll) => (
                    <TableRow key={payroll._id}>
                      <TableCell className="font-medium">{payroll.employeeName}</TableCell>
                      <TableCell>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${payroll.contract === 'CLT' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'}
                        `}>
                          {payroll.contract}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(payroll.baseSalary || 0)}</TableCell>
                      <TableCell>
                        {payroll.contract === 'CLT' 
                          ? formatCurrency(payroll.deductions || 0)
                          : '-'}
                      </TableCell>
                      <TableCell>{formatCurrency(payroll.totalSalary || 0)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPayslip(payroll._id)}
                          disabled={downloadingId === payroll._id}
                        >
                          {downloadingId === payroll._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Download className="h-4 w-4 mr-1" />
                          )}
                          Holerite
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}