'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts'
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
  PieChart as PieChartIcon,
  FileSpreadsheet,  
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { 
  getFinancialReports, 
  getEmployerChargesData, 
  getEmployeeDeductionsData, 
  formatCurrency,
  ISummaryItem,
  IDepartmentItem,
  ISummary,
  IChartDataItem
} from '@/services/reports-service'
import Link from 'next/link'

// Importar bibliotecas para exportação
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { UserOptions } from 'jspdf-autotable'

// Definindo tipagens necessárias
interface IReportData {
  summaryData: ISummaryItem[];
  departmentData: IDepartmentItem[];
  summary: ISummary;
  totalBenefits?: number;
  transportVoucher?: number;
  otherDeductions?: number;
}

interface MonthOption {
  value: string;
  label: string;
}

interface DepartmentOption {
  value: string;
  label: string;
}

// Paleta de cores para os gráficos
const COLORS: string[] = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Meses disponíveis para seleção
const defaultMonths: MonthOption[] = [
  { value: '1', label: 'Janeiro/2025' },
  { value: '2', label: 'Fevereiro/2025' },
  { value: '3', label: 'Março/2025' },
  { value: '4', label: 'Abril/2025' },
  { value: '5', label: 'Maio/2025' },
  { value: '6', label: 'Junho/2025' },
  { value: '7', label: 'Julho/2025' },
  { value: '8', label: 'Agosto/2025' },
  { value: '9', label: 'Setembro/2025' },
  { value: '10', label: 'Outubro/2025' },
  { value: '11', label: 'Novembro/2025' },
  { value: '12', label: 'Dezembro/2025' }
];

export default function RelatoriosPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('3');
  const selectedYear = '2025'; // Ano atual como constante
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('resumo');
  const [reportData, setReportData] = useState<IReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [months] = useState<MonthOption[]>(defaultMonths); 
  
  // Estado para armazenar os departamentos obtidos da API
  const [departments, setDepartments] = useState<DepartmentOption[]>([
    { value: 'all', label: 'Todos os departamentos' }
  ]);
  
  // Buscar departamentos da API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
        } else {
          console.error('Erro ao buscar departamentos:', response.statusText);
        }
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
      }
    };
    
    fetchDepartments();
  }, []);

  // Efeito para carregar dados quando o mês, ano ou departamento mudar
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getFinancialReports(selectedMonth, selectedYear, selectedDepartment);
        setReportData(data);
      } catch (err) {
        console.error('Erro ao buscar dados de relatórios:', err);
        
        if (err instanceof Error) {
          setError(`Erro: ${err.message}`);
        } else {
          setError('Não foi possível carregar os dados de relatórios. Tente novamente mais tarde.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportData();
  }, [selectedMonth, selectedYear, selectedDepartment]);

  // Função para gerar o relatório em PDF
  const generatePdfReport = (): void => {
    try {
      if (!reportData) {
        alert('Não há dados para exportar');
        return;
      }
      
      const doc = new jsPDF();
      
      // Adicionar título
      doc.setFontSize(16);
      doc.text(`Relatório Financeiro - ${getMonthName(selectedMonth)}/${selectedYear}`, 14, 15);
      
      (doc as unknown as { autoTable: (options: UserOptions) => void }).autoTable({
        startY: 25,
        head: [['Descrição', 'Valor (R$)']],
        body: reportData.summaryData.map(item => [
          item.description, 
          formatCurrency(item.value)
        ]),
        theme: 'grid',
      });
      
      // Adicionar tabela de departamentos em uma nova página
      doc.addPage();
      doc.setFontSize(16);
      doc.text(`Relatório por Departamento - ${getMonthName(selectedMonth)}/${selectedYear}`, 14, 15);
      
      (doc as unknown as { autoTable: (options: UserOptions) => void }).autoTable({
        startY: 25,
        head: [['Departamento', 'Funcionários', 'Salário Base', 'Horas Extras', 'Líquido Total']],
        body: reportData.departmentData.map(dept => [
          dept.department,
          dept.employees.toString(),
          formatCurrency(dept.totalBase),
          formatCurrency(dept.totalExtra),
          formatCurrency(dept.totalNet)
        ]),
        theme: 'grid',
      });
      
      // Salvar o PDF
      doc.save(`Relatório_Financeiro_${getMonthName(selectedMonth)}_${selectedYear}.pdf`);
      
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar o relatório PDF.');
    }
  };

  // Função para exportar para Excel
  const exportToExcel = (): void => {
    try {
      if (!reportData) {
        alert('Não há dados para exportar');
        return;
      }
      
      // Criar uma nova planilha
      const wb = XLSX.utils.book_new();
      
      // Adicionar planilha com resumo geral
      const summarySheet = XLSX.utils.json_to_sheet(
        reportData.summaryData.map(item => ({
          Descrição: item.description,
          Valor: item.value
        }))
      );
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo Geral');
      
      // Adicionar planilha com dados por departamento
      const deptSheet = XLSX.utils.json_to_sheet(
        reportData.departmentData.map(dept => ({
          Departamento: dept.department,
          Funcionários: dept.employees,
          'Salário Base': dept.totalBase,
          'Horas Extras': dept.totalExtra,
          'Total Líquido': dept.totalNet,
          'Média por Funcionário': dept.totalNet / dept.employees
        }))
      );
      XLSX.utils.book_append_sheet(wb, deptSheet, 'Departamentos');
      
      // Gerar o arquivo e fazer download
      XLSX.writeFile(wb, `Relatório_Financeiro_${getMonthName(selectedMonth)}_${selectedYear}.xlsx`);
      
    } catch (err) {
      console.error('Erro ao exportar para Excel:', err);
      alert('Erro ao exportar os dados para Excel.');
    }
  };

  // Função para imprimir o relatório
  const printReport = (): void => {
    try {
      const printContent = document.getElementById('report-content');
      if (!printContent) {
        alert('Conteúdo para impressão não encontrado');
        return;
      }
      
      const originalContents = document.body.innerHTML;
      const printStyles = `
        <style>
          @media print {
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            h1, h2 { margin-bottom: 10px; }
            .no-print { display: none; }
          }
        </style>
      `;
      
      const printTitle = `
        <h1>Relatório Financeiro - ${getMonthName(selectedMonth)}/${selectedYear}</h1>
        <p>${selectedDepartment !== 'all' ? `Departamento: ${getDepartmentName(selectedDepartment)}` : 'Todos os departamentos'}</p>
      `;
      
      document.body.innerHTML = printStyles + printTitle + printContent.innerHTML;
      
      window.print();
      
      document.body.innerHTML = originalContents;
      
      // Recarregar scripts e handlers
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (err) {
      console.error('Erro ao imprimir relatório:', err);
      alert('Erro ao imprimir o relatório.');
    }
  };

  // Função para obter o nome do mês
  const getMonthName = (monthNumber: string): string => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return monthNames[parseInt(monthNumber) - 1];
  };

  // Função para obter o nome amigável do departamento
  const getDepartmentName = (departmentValue: string): string => {
    if (departmentValue === 'all') return 'Todos os departamentos';
    if (departmentValue === 'noDepartment') return 'Sem Departamento';
    
    const dept = departments.find(d => d.value === departmentValue);
    return dept ? dept.label.split(' (')[0] : departmentValue;
  };

  // Conteúdo para exibir durante o carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Carregando dados dos relatórios...</p>
      </div>
    );
  }

  // Conteúdo para exibir em caso de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg text-red-500">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Fallback para dados de exemplo quando a API ainda não retornou ou para testes
  const summaryData: ISummaryItem[] = reportData?.summaryData || [
    { id: 1, description: 'Total Salários Base', value: 65200.00 },
    { id: 2, description: 'Total Horas Extras', value: 4875.50 },
    { id: 3, description: 'Total INSS', value: 8450.30 },
    { id: 4, description: 'Total FGTS', value: 5605.10 },
    { id: 5, description: 'Total IRRF', value: 7235.80 },
    { id: 6, description: 'Total Vale Transporte', value: 2800.00 },
    { id: 7, description: 'Total Vale Alimentação', value: 5200.00 },
    { id: 8, description: 'Total Outros Descontos', value: 1350.00 },
    { id: 9, description: 'Total Líquido Pago', value: 49913.40 }
  ];

  const departmentData: IDepartmentItem[] = reportData?.departmentData || [
    { id: 1, department: 'Tecnologia', employees: 8, totalBase: 24800.00, totalExtra: 1850.00, totalNet: 20140.00 },
    { id: 2, department: 'Recursos Humanos', employees: 4, totalBase: 12000.00, totalExtra: 650.00, totalNet: 9850.00 },
    { id: 3, department: 'Financeiro', employees: 6, totalBase: 18000.00, totalExtra: 1200.00, totalNet: 14300.00 },
    { id: 4, department: 'Marketing', employees: 3, totalBase: 10400.00, totalExtra: 1175.50, totalNet: 9320.00 }
  ];
  
  // Dados agregados do resumo
  const summary: ISummary = reportData?.summary || {
    totalBaseSalary: 65200.00,
    totalOvertimePay: 4875.50,
    totalINSS: 8450.30,
    totalFGTS: 5605.10,
    totalIRRF: 7235.80,
    totalBenefits: 8000.00,
    totalDeductions: 19836.10,
    totalNetSalary: 49913.40
  };

  // Dados para gráficos
  const costCompositionData: IChartDataItem[] = [
    { name: 'Salários', value: summary.totalBaseSalary },
    { name: 'Horas Extras', value: summary.totalOvertimePay },
    { name: 'INSS', value: summary.totalINSS },
    { name: 'FGTS', value: summary.totalFGTS },
    { name: 'IRRF', value: summary.totalIRRF },
    { name: 'Benefícios', value: reportData?.totalBenefits || 8000 }
  ];

  // Dados para o gráfico de pizza departamental
  const departmentChartData: IChartDataItem[] = departmentData.map(dept => ({
    name: dept.department,
    value: dept.totalNet
  }));

  // Dados para o gráfico de encargos do empregador
  const employerChargesData: IChartDataItem[] = getEmployerChargesData(summary.totalBaseSalary + summary.totalOvertimePay);

  // Dados para o gráfico de descontos do funcionário
  const employeeDeductionsData: IChartDataItem[] = getEmployeeDeductionsData(
    summary.totalINSS,
    summary.totalIRRF,
    reportData?.transportVoucher || 2800,
    reportData?.otherDeductions || 1350
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/dashboard/folha-pagamento">
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
                <SelectValue placeholder="Selecione o cargo" />
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

      <div id="report-content">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" /> Resumo Geral
            </TabsTrigger>
            <TabsTrigger value="departamentos" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" /> Por Departamento
            </TabsTrigger>
            <TabsTrigger value="impostos" className="flex items-center">
              <PieChartIcon className="mr-2 h-4 w-4" /> Impostos e Encargos
            </TabsTrigger>
          </TabsList>
          {/* Aba de Resumo Geral */}
          <TabsContent value="resumo" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Folha de Pagamento</CardTitle>
                <CardDescription>
                  {getMonthName(selectedMonth)}/{selectedYear}
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
                            {formatCurrency(item.value)}
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
                    {formatCurrency(summary.totalBaseSalary + summary.totalOvertimePay)}
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
                    {formatCurrency(summary.totalDeductions)}
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
                    {formatCurrency(summary.totalFGTS)}
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
                    {formatCurrency(summary.totalNetSalary)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor total a pagar
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* Gráfico de composição de custos */}
            {/* Gráfico de composição de custos */}
            <Card>
              <CardHeader>
                <CardTitle>Composição dos Custos</CardTitle>
                <CardDescription>
                  Distribuição de salários e encargos por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={costCompositionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                      <Tooltip 
                        formatter={(value, name) => [formatCurrency(value as number), name]}
                      />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Valor" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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
                            {formatCurrency(dept.totalBase)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(dept.totalExtra)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(dept.totalNet)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(dept.totalNet / dept.employees)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold">
                        <TableCell>TOTAL</TableCell>
                        <TableCell className="text-center">
                          {departmentData.reduce((sum, dept) => sum + dept.employees, 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(departmentData.reduce((sum, dept) => sum + dept.totalBase, 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(departmentData.reduce((sum, dept) => sum + dept.totalExtra, 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(departmentData.reduce((sum, dept) => sum + dept.totalNet, 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(departmentData.reduce((sum, dept) => sum + dept.totalNet, 0) / 
                                        departmentData.reduce((sum, dept) => sum + dept.employees, 0))}
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
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [formatCurrency(value as number), name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Gráfico de Barras por Departamento */}            {/* Gráfico de Barras por Departamento */}
              {/* Gráfico de Barras por Departamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparativo de Custos por Departamento</CardTitle>
                  <CardDescription>
                    Breakdown dos custos salariais por departamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                        <Tooltip 
                          formatter={(value, name) => [formatCurrency(value as number), name]}
                        />
                        <Legend />
                        <Bar dataKey="totalBase" name="Salário Base" fill="#8884d8" />
                        <Bar dataKey="totalExtra" name="Horas Extras" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          {/* Aba de Impostos e Encargos */}{/* Aba de Impostos e Encargos */}
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
                          {formatCurrency(summary.totalBaseSalary + summary.totalOvertimePay)}
                        </TableCell>
                        <TableCell className="text-right">20%</TableCell>
                        <TableCell className="text-right">20%</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((summary.totalBaseSalary + summary.totalOvertimePay) * 0.2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">INSS - Funcionários</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(summary.totalBaseSalary + summary.totalOvertimePay)}
                        </TableCell>
                        <TableCell className="text-right">7.5% - 14%</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(summary.totalINSS)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">FGTS</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(summary.totalBaseSalary + summary.totalOvertimePay)}
                        </TableCell>
                        <TableCell className="text-right">8%</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(summary.totalFGTS)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">IRRF</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((summary.totalBaseSalary + summary.totalOvertimePay) - summary.totalINSS)}
                        </TableCell>
                        <TableCell className="text-right">Tabela</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(summary.totalIRRF)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">PIS/PASEP</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(summary.totalBaseSalary + summary.totalOvertimePay)}
                        </TableCell>
                        <TableCell className="text-right">1%</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((summary.totalBaseSalary + summary.totalOvertimePay) * 0.01)}
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
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={employerChargesData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {employerChargesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [formatCurrency(value as number), name]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
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
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={employeeDeductionsData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {employeeDeductionsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [formatCurrency(value as number), name]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
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
                      <span className="text-xs text-muted-foreground mt-1">Vencimento: 20/{parseInt(selectedMonth) + 1}/2025</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 mb-2" />
                      <span>GPS - INSS</span>
                      <span className="text-xs text-muted-foreground mt-1">Vencimento: 20/{parseInt(selectedMonth) + 1}/2025</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 mb-2" />
                      <span>GFIP - FGTS</span>
                      <span className="text-xs text-muted-foreground mt-1">Vencimento: 07/{parseInt(selectedMonth) + 1}/2025</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }