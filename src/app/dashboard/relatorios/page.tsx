'use client'

import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Download, FileText, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import axios from 'axios'
import { formatCurrency } from '@/lib/utils'

export default function RelatoriosPage() {
  const [reportType, setReportType] = useState('funcionarios')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  type ReportData = 
    | { _id: string; name: string; role: string; department: string; admissao: string; salario: number | string; status: string }
    | { name: string; date?: string; entryTime?: string; leaveTime?: string; totalHours?: string | number }
    | { _id: string; name: string; cpf: string; phone: string; logs?: Array<{ entryTime: string; leaveTime?: string }> }
    | { _id: string; name: string; company: string; service: string; cnpj?: string; cpf?: string; logs?: Array<{ entryTime: string; leaveTime?: string }> }
    | { _id: string; employeeName: string; contract: string; baseSalary: number; overtimePay?: number; deductions: number; totalSalary: number; status: string }
    | { id: string; description: string; value: number };
    
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([])
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const reportTypes = [
    { value: 'funcionarios', label: 'Relatório de Funcionários' },
    { value: 'ponto', label: 'Relatório de Controle de Ponto' },
    { value: 'visitantes', label: 'Relatório de Visitantes' },
    { value: 'prestadores', label: 'Relatório de Prestadores de Serviço' },
    { value: 'folha-pagamento', label: 'Relatório de Folha de Pagamento' },
    { value: 'financeiro', label: 'Relatório Financeiro' }
  ]

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ]

  useEffect(() => {
    // Carregar departamentos quando o componente montar
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Erro ao carregar departamentos:', error);
      }
    };

    fetchDepartments();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      let response;

      switch (reportType) {
        case 'funcionarios':
          response = await axios.get('/api/reports/workers', { 
            params: { department: departmentFilter } 
          });
          break;
        case 'ponto':
          response = await axios.get('/api/reports/timesheet', { 
            params: { month, year } 
          });
          break;
        case 'visitantes':
          response = await axios.get('/api/reports/visitors', { 
            params: { 
              startDate: format(new Date(year, month - 1, 1), 'yyyy-MM-dd'),
              endDate: format(new Date(year, month, 0), 'yyyy-MM-dd')
            } 
          });
          break;
        case 'prestadores':
          response = await axios.get('/api/reports/prestadores', { 
            params: { 
              startDate: format(new Date(year, month - 1, 1), 'yyyy-MM-dd'),
              endDate: format(new Date(year, month, 0), 'yyyy-MM-dd')
            } 
          });
          break;
        case 'folha-pagamento':
          response = await axios.get('/api/payroll/process', { 
            params: { month, year } 
          });
          setReportData(response.data.payrolls);
          break;
        case 'financeiro':
          response = await axios.get('/api/reports/financial', { 
            params: { month, year, department: departmentFilter } 
          });
          setReportData(response.data.summaryData);
          break;
        default:
          throw new Error('Tipo de relatório desconhecido');
      }

      if (reportType !== 'folha-pagamento' && reportType !== 'financeiro') {
        setReportData(response.data);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  }

  const exportToPdf = async () => {
    try {
      setExportLoading(true);
      let url = '';

      // Determinar a URL para exportar o PDF com base no tipo de relatório
      switch (reportType) {
        case 'funcionarios':
          url = `/api/reports/workers/export?department=${departmentFilter}&format=pdf`;
          break;
        case 'ponto':
          url = `/api/reports/timesheet/export?month=${month}&year=${year}&format=pdf`;
          break;
        case 'visitantes':
          url = `/api/reports/visitors/export?startDate=${format(new Date(year, month - 1, 1), 'yyyy-MM-dd')}&endDate=${format(new Date(year, month, 0), 'yyyy-MM-dd')}&format=pdf`;
          break;
        case 'prestadores':
          url = `/api/reports/prestadores/export?startDate=${format(new Date(year, month - 1, 1), 'yyyy-MM-dd')}&endDate=${format(new Date(year, month, 0), 'yyyy-MM-dd')}&format=pdf`;
          break;
        case 'folha-pagamento':
          url = `/api/reports/payroll/export?month=${month}&year=${year}&format=pdf`;
          break;
        case 'financeiro':
          url = `/api/reports/financial/export?month=${month}&year=${year}&department=${departmentFilter}&format=pdf`;
          break;
        default:
          throw new Error('Tipo de relatório desconhecido');
      }

      // Usando a API de fetch para obter o PDF como blob
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Criar URL para o blob e simular clique para download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Relatório_${reportType}_${month}_${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      alert('Erro ao exportar para PDF. Verifique o console para mais detalhes.');
    } finally {
      setExportLoading(false);
    }
  }

  const renderReportTable = () => {
    if (reportData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Selecione os parâmetros acima e clique em &quot;Gerar Relatório&quot; para visualizar os dados.
        </div>
      );
    }

    switch (reportType) {
      case 'funcionarios': {
        // Type assertion for the worker data
        const workersData = reportData as Array<{ 
          _id: string; 
          name: string; 
          role: string; 
          department: string; 
          admissao: string; 
          salario: number | string; 
          status: string 
        }>;
        
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Data Admissão</TableHead>
                <TableHead>Salário</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workersData.map((worker) => (
                <TableRow key={worker._id}>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.role}</TableCell>
                  <TableCell>{worker.department}</TableCell>
                  <TableCell>{format(new Date(worker.admissao), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{formatCurrency(Number(worker.salario))}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-block px-2 py-1 rounded text-xs font-medium",
                      worker.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                      {worker.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }
        
      case 'ponto':
        // Type assertion for timesheet data
        const timesheetData = reportData as Array<{ 
          name: string; 
          date?: string; 
          entryTime?: string; 
          leaveTime?: string; 
          totalHours?: string | number 
        }>;
        
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Total de Horas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheetData.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.date ? format(new Date(entry.date), 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell>{entry.entryTime ? format(new Date(entry.entryTime), 'HH:mm') : '-'}</TableCell>
                  <TableCell>{entry.leaveTime ? format(new Date(entry.leaveTime), 'HH:mm') : '-'}</TableCell>
                  <TableCell>{entry.totalHours || '-'}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-block px-2 py-1 rounded text-xs font-medium",
                      !entry.entryTime ? "bg-red-100 text-red-800" : 
                      !entry.leaveTime ? "bg-yellow-100 text-yellow-800" : 
                      "bg-green-100 text-green-800"
                    )}>
                      {!entry.entryTime ? "Ausente" : 
                       !entry.leaveTime ? "Sem saída" : 
                       "Presente"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
        
      case 'visitantes': {
        // Type assertion for visitor data
        const visitorData = reportData as Array<{ 
          _id: string; 
          name: string; 
          cpf: string; 
          phone: string; 
          logs?: Array<{ entryTime: string; leaveTime?: string }> 
        }>;
        
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data da Visita</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitorData.map((visitor) => (
                <TableRow key={visitor._id}>
                  <TableCell>{visitor.name}</TableCell>
                  <TableCell>{visitor.cpf}</TableCell>
                  <TableCell>{visitor.phone}</TableCell>
                  <TableCell>
                    {visitor.logs && visitor.logs.length > 0 
                      ? format(new Date(visitor.logs[visitor.logs.length - 1].entryTime), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {visitor.logs && visitor.logs.length > 0 
                      ? format(new Date(visitor.logs[visitor.logs.length - 1].entryTime), 'HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {visitor.logs && visitor.logs.length > 0 && visitor.logs[visitor.logs.length - 1].leaveTime
                      ? format(new Date(visitor.logs[visitor.logs.length - 1].leaveTime as string), 'HH:mm')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }
      
      case 'prestadores': {
        // Type assertion for prestadores data
        const prestadoresData = reportData as Array<{ 
          _id: string; 
          name: string; 
          company: string; 
          service: string; 
          cnpj?: string; 
          cpf?: string; 
          logs?: Array<{ entryTime: string; leaveTime?: string }> 
        }>;
        
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prestadoresData.map((prestador) => (
                <TableRow key={prestador._id}>
                  <TableCell>{prestador.name}</TableCell>
                  <TableCell>{prestador.company}</TableCell>
                  <TableCell>{prestador.service}</TableCell>
                  <TableCell>{prestador.cnpj || prestador.cpf || '-'}</TableCell>
                  <TableCell>
                    {prestador.logs && prestador.logs.length > 0
                      ? format(new Date(prestador.logs[prestador.logs.length - 1].entryTime), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {prestador.logs && prestador.logs.length > 0
                      ? format(new Date(prestador.logs[prestador.logs.length - 1].entryTime), 'HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {prestador.logs && prestador.logs.length > 0 && prestador.logs[prestador.logs.length - 1].leaveTime
                      ? format(new Date(prestador.logs[prestador.logs.length - 1].leaveTime as string), 'HH:mm')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }
      
      case 'folha-pagamento': {
        // Type assertion for payroll data
        const payrollData = reportData as Array<{ 
          _id: string; 
          employeeName: string; 
          contract: string; 
          baseSalary: number; 
          overtimePay?: number; 
          deductions: number; 
          totalSalary: number; 
          status: string 
        }>;
        
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Salário Base</TableHead>
                <TableHead>Horas Extras</TableHead>
                <TableHead>Deduções</TableHead>
                <TableHead>Salário Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollData.map((payroll) => (
                <TableRow key={payroll._id}>
                  <TableCell>{payroll.employeeName}</TableCell>
      <TableCell>{payroll.contract}</TableCell>
      <TableCell>{formatCurrency(payroll.baseSalary)}</TableCell>
      <TableCell>{formatCurrency(payroll.overtimePay || 0)}</TableCell>
      <TableCell>{formatCurrency(payroll.deductions)}</TableCell>
      <TableCell>{formatCurrency(payroll.totalSalary)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-block px-2 py-1 rounded text-xs font-medium",
                      payroll.status === "paid" ? "bg-green-100 text-green-800" : 
                      payroll.status === "processed" ? "bg-blue-100 text-blue-800" : 
                      "bg-yellow-100 text-yellow-800"
                    )}>
                      {payroll.status === "paid" ? "Pago" : 
                       payroll.status === "processed" ? "Processado" : 
                       "Pendente"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }
      
      case 'financeiro': {
        // Type assertion for financial data
        const financialData = reportData as Array<{ 
          id: string; 
          description: string; 
          value: number 
        }>;
        
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      }
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Relatórios</h1>
          <p className="dark:text-gray-300">Geração e visualização de relatórios</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros do Relatório</CardTitle>
          <CardDescription>Selecione os parâmetros para gerar o relatório desejado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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

            {reportType !== 'funcionarios' && (
              <div>
                <label className="block mb-2">Mês</label>
                <Select 
                  value={String(month)}
                  onValueChange={(value) => setMonth(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

            {(reportType === 'funcionarios' || reportType === 'financeiro') && (
              <div>
                <label className="block mb-2">Departamento</label>
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={generateReport} 
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Relatório'
              )}
            </Button>
            
            <Button 
              onClick={exportToPdf} 
              variant="outline" 
              className="flex-1"
              disabled={reportData.length === 0 || exportLoading}
            >
              {exportLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar para PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Visualização de Relatório */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visualização do Relatório</CardTitle>
            <div className="flex items-center text-sm text-gray-500">
              <FileText className="h-4 w-4 mr-1" />
              {reportData.length} registros
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          {renderReportTable()}
        </CardContent>
      </Card>
    </div>
  )
}