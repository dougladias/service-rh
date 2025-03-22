'use client'

import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  FileText,
  Download,
  Printer,
  BarChart3,
  PieChart,
  FileSpreadsheet  
} from 'lucide-react'
import Link from 'next/link'

// Dados de exemplo para os relatórios
const months = [
  { value: '3/2024', label: 'Março/2024' },
  { value: '2/2024', label: 'Fevereiro/2024' },
  { value: '1/2024', label: 'Janeiro/2024' }
]

const departments = [
  { value: 'all', label: 'Todos os departamentos' },
  { value: 'tech', label: 'Tecnologia' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'finance', label: 'Financeiro' },
  { value: 'marketing', label: 'Marketing' }
]

const summaryData = [
  { id: 1, description: 'Total Salários Base', value: 65200.00 },
  { id: 2, description: 'Total Horas Extras', value: 4875.50 },
  { id: 3, description: 'Total INSS', value: 8450.30 },
  { id: 4, description: 'Total FGTS', value: 5605.10 },
  { id: 5, description: 'Total IRRF', value: 7235.80 },
  { id: 6, description: 'Total Vale Transporte', value: 2800.00 },
  { id: 7, description: 'Total Vale Alimentação', value: 5200.00 },
  { id: 8, description: 'Total Outros Descontos', value: 1350.00 },
  { id: 9, description: 'Total Líquido Pago', value: 49913.40 }
]

const departmentData = [
  { id: 1, department: 'Tecnologia', employees: 8, totalBase: 24800.00, totalExtra: 1850.00, totalNet: 20140.00 },
  { id: 2, department: 'Recursos Humanos', employees: 4, totalBase: 12000.00, totalExtra: 650.00, totalNet: 9850.00 },
  { id: 3, department: 'Financeiro', employees: 6, totalBase: 18000.00, totalExtra: 1200.00, totalNet: 14300.00 },
  { id: 4, department: 'Marketing', employees: 3, totalBase: 10400.00, totalExtra: 1175.50, totalNet: 9320.00 }
]

export default function RelatoriosPage() {
  const [selectedMonth, setSelectedMonth] = useState('3/2024')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [activeTab, setActiveTab] = useState('resumo')

  // Função para gerar o relatório PDF
  const generatePdfReport = () => {
    alert('Relatório PDF gerado com sucesso!')
  }

  // Função para exportar para Excel
  const exportToExcel = () => {
    alert('Dados exportados para Excel com sucesso!')
  }

  // Função para imprimir o relatório
  const printReport = () => {
    alert('Enviando relatório para impressão...')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="dashboard/folha-pagamento">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Relatórios e análises da folha de pagamento</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
          <div className="w-full md:w-64">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={printReport}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={generatePdfReport}>
            <Download className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumo" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Resumo Geral
          </TabsTrigger>
          <TabsTrigger value="departamentos" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" /> Por Departamento
          </TabsTrigger>
          <TabsTrigger value="impostos" className="flex items-center">
            <PieChart className="mr-2 h-4 w-4" /> Impostos e Encargos
          </TabsTrigger>
        </TabsList>
        
        {/* Aba de Resumo Geral */}
        <TabsContent value="resumo" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Folha de Pagamento</CardTitle>
              <CardDescription>
                {selectedMonth === '3/2024' ? 'Março/2024' : 
                 selectedMonth === '2/2024' ? 'Fevereiro/2024' : 'Janeiro/2024'}
                {selectedDepartment !== 'all' && ` - ${departments.find(d => d.value === selectedDepartment)?.label}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor (R$)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {item.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bruto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(65200 + 4875.50).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
                <p className="text-xs text-muted-foreground">
                  Salários base + horas extras
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Descontos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(8450.30 + 7235.80 + 2800 + 1350).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
                <p className="text-xs text-muted-foreground">
                  INSS + IRRF + VT + Outros
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total FGTS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {5605.10.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
                <p className="text-xs text-muted-foreground">
                  8% sobre remuneração
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Líquido Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {49913.40.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor total a pagar
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Aba de Departamentos */}
        <TabsContent value="departamentos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Folha por Departamento</CardTitle>
              <CardDescription>
                Detalhamento dos valores pagos por departamento
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Departamento</TableHead>
                      <TableHead className="text-center">Nº Funcionários</TableHead>
                      <TableHead className="text-right">Salário Base</TableHead>
                      <TableHead className="text-right">Horas Extras</TableHead>
                      <TableHead className="text-right">Líquido Total</TableHead>
                      <TableHead className="text-right">Média por Funcionário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentData.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell className="text-center">{dept.employees}</TableCell>
                        <TableCell className="text-right">
                          R$ {dept.totalBase.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {dept.totalExtra.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {dept.totalNet.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {(dept.totalNet / dept.employees).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-center">
                        {departmentData.reduce((sum, dept) => sum + dept.employees, 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {departmentData.reduce((sum, dept) => sum + dept.totalBase, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {departmentData.reduce((sum, dept) => sum + dept.totalExtra, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {departmentData.reduce((sum, dept) => sum + dept.totalNet, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {(departmentData.reduce((sum, dept) => sum + dept.totalNet, 0) / 
                             departmentData.reduce((sum, dept) => sum + dept.employees, 0)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Participação por Departamento</CardTitle>
              <CardDescription>
                Percentual da folha de pagamento por departamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <p className="text-center text-muted-foreground">
                  Aqui seria exibido um gráfico com a distribuição percentual da folha por departamento.
                  <br />
                  (Utilize componentes como Recharts ou Chart.js para implementar este gráfico)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Impostos e Encargos */}
        <TabsContent value="impostos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Impostos e Encargos</CardTitle>
              <CardDescription>
                Detalhamento dos impostos e encargos trabalhistas
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Base de Cálculo</TableHead>
                      <TableHead className="text-right">Alíquota</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INSS - Empresa</TableCell>
                      <TableCell className="text-right">
                        R$ {70075.50.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">20%</TableCell>
                      <TableCell className="text-right">
                        R$ {14015.10.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INSS - Funcionários</TableCell>
                      <TableCell className="text-right">
                        R$ {70075.50.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">7.5% - 14%</TableCell>
                      <TableCell className="text-right">
                        R$ {8450.30.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">FGTS</TableCell>
                      <TableCell className="text-right">
                        R$ {70075.50.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">8%</TableCell>
                      <TableCell className="text-right">
                        R$ {5605.10.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">IRRF</TableCell>
                      <TableCell className="text-right">
                        R$ {61625.20.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">Tabela</TableCell>
                      <TableCell className="text-right">
                        R$ {7235.80.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">PIS/PASEP</TableCell>
                      <TableCell className="text-right">
                        R$ {70075.50.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">1%</TableCell>
                      <TableCell className="text-right">
                        R$ {700.76.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Encargos do Empregador</CardTitle>
                <CardDescription>
                  Total de encargos pagos pela empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    Aqui seria exibido um gráfico de pizza com a distribuição dos encargos do empregador.
                    <br />
                    (Utilize componentes como Recharts ou Chart.js para implementar este gráfico)
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Descontos do Funcionário</CardTitle>
                <CardDescription>
                  Total de descontos na folha dos funcionários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    Aqui seria exibido um gráfico de pizza com a distribuição dos descontos dos funcionários.
                    <br />
                    (Utilize componentes como Recharts ou Chart.js para implementar este gráfico)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Guias para Pagamento</CardTitle>
              <CardDescription>
                Guias geradas para pagamento de impostos e encargos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 mb-2" />
                  <span>DARF - IRRF</span>
                  <span className="text-xs text-muted-foreground mt-1">Vencimento: 20/04/2024</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 mb-2" />
                  <span>GPS - INSS</span>
                  <span className="text-xs text-muted-foreground mt-1">Vencimento: 20/04/2024</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 mb-2" />
                  <span>GFIP - FGTS</span>
                  <span className="text-xs text-muted-foreground mt-1">Vencimento: 07/04/2024</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}