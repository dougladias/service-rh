

'use client'

import { useState } from 'react'
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
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  getPayrolls, 
  processPayroll, 
  generatePayslip 
} from '@/services/payroll-service'
import { Payroll, PayrollFilter } from '@/types/payroll'
import { 
  FileText, 
  Download 
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>(getPayrolls())
  const [filter, setFilter] = useState<PayrollFilter>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  const handleProcessPayroll = async () => {
    if (filter.month && filter.year) {
      const processedPayrolls = await processPayroll(filter.month, filter.year)
      setPayrolls(processedPayrolls)
    }
  }

  const handleDownloadPayslip = async (payrollId: string) => {
    try {
      const pdfBlob = await generatePayslip(payrollId)
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `holerite_${payrollId}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao gerar holerite:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Folha de Pagamento</h1>
          <p className="text-gray-600">Processamento e gestão de folha de pagamento</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <FileText className="mr-2" size={16} /> Processar Folha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Processar Folha de Pagamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="month" className="text-right">Mês</label>
                <Select 
                  value={String(filter.month)} 
                  onValueChange={(value) => setFilter(prev => ({
                    ...prev, 
                    month: Number(value)
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <SelectItem key={month} value={String(month)}>
                        {new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="year" className="text-right">Ano</label>
                <Select 
                  value={String(filter.year)} 
                  onValueChange={(value) => setFilter(prev => ({
                    ...prev, 
                    year: Number(value)
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025].map(year => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleProcessPayroll}>
                Processar Folha
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Folha de Pagamento */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Mês/Ano</TableHead>
            <TableHead>Salário Base</TableHead>
            <TableHead>Horas Extras</TableHead>
            <TableHead>Descontos</TableHead>
            <TableHead>Salário Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payrolls.map((payroll) => (
            <TableRow key={payroll.id}>
              <TableCell>{payroll.employeeName}</TableCell>
              <TableCell>
                {`${payroll.month}/${payroll.year}`}
              </TableCell>
              <TableCell>{formatCurrency(payroll.baseSalary)}</TableCell>
              <TableCell>{formatCurrency(payroll.overtimePay)}</TableCell>
              <TableCell>{formatCurrency(payroll.deductions)}</TableCell>
              <TableCell>{formatCurrency(payroll.totalSalary)}</TableCell>
              <TableCell>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${
                    payroll.status === 'processed' 
                      ? 'bg-green-100 text-green-800' 
                      : payroll.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }
                `}>
                  {
                    payroll.status === 'processed' 
                      ? 'Processado' 
                      : payroll.status === 'pending'
                      ? 'Pendente'
                      : 'Pago'
                  }
                </span>
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDownloadPayslip(payroll.id)}
                >
                  <Download size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}