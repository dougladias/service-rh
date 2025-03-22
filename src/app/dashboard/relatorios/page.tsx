

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

export default function RelatoriosPage() {
  const [reportType, setReportType] = useState('funcionarios')
  const [year, setYear] = useState(new Date().getFullYear())

  const reportTypes = [
    { value: 'funcionarios', label: 'Relatório de Funcionários' },
    { value: 'folha-pagamento', label: 'Relatório de Folha de Pagamento' },
    { value: 'financeiro', label: 'Relatório Financeiro' }
  ]

  const generateReport = () => {
    // Lógica para gerar relatório
    console.log(`Gerando relatório de ${reportType} para o ano de ${year}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Relatórios</h1>
          <p className="dark:text-gray-300">Geração e visualização de relatórios</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Tipo de Relatório</label>
            <Select 
              value={reportType}
              onValueChange={setReportType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2">Ano</label>
            <Select 
              value={String(year)}
              onValueChange={(value) => setYear(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {[2022, 2023, 2024, 2025].map((yr) => (
                  <SelectItem key={yr} value={String(yr)}>
                    {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generateReport} className="w-full">
          Gerar Relatório
        </Button>
      </div>

      {/* Seção de Visualização de Relatório */}
      <div className="dark:bg-gray-800 bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Visualização do Relatório</h3>
        {/* Tabela de exemplo - será substituída pela lógica real de relatórios */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Exemplo de Relatório</TableCell>
              <TableCell>R$ 1.000,00</TableCell>
              <TableCell>01/01/2024</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}