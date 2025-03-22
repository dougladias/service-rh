'use client'

import { useState } from 'react'
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
  Eye
} from 'lucide-react'
import Link from 'next/link'

// Definição da interface para o tipo Holerite
interface Holerite {
  id: number;
  employee: string;
  month: string;
  status: string;
  position: string;
  department: string;
  salary: number;
  extraHours: number;
  deductions: number;
  netSalary: number;
  createdAt: string;
}

// Dados de exemplo para holerites
const holerites: Holerite[] = [
  {
    id: 1,
    employee: 'Maria Silva',
    month: '3/2024',
    status: 'Gerado',
    position: 'Desenvolvedora',
    department: 'TI',
    salary: 7500.00,
    extraHours: 1125.00,
    deductions: 1200.00,
    netSalary: 7425.00,
    createdAt: '28/03/2024'
  },
  {
    id: 2,
    employee: 'João Costa',
    month: '3/2024',
    status: 'Gerado',
    position: 'Designer',
    department: 'Marketing',
    salary: 6200.00,
    extraHours: 620.00,
    deductions: 950.00,
    netSalary: 5870.00,
    createdAt: '28/03/2024'
  },
  {
    id: 3,
    employee: 'Ana Oliveira',
    month: '3/2024',
    status: 'Pendente',
    position: 'Analista Financeiro',
    department: 'Financeiro',
    salary: 5500.00,
    extraHours: 0.00,
    deductions: 800.00,
    netSalary: 4700.00,
    createdAt: '28/03/2024'
  },
  {
    id: 4,
    employee: 'Maria Silva',
    month: '2/2024',
    status: 'Gerado',
    position: 'Desenvolvedora',
    department: 'TI',
    salary: 7500.00,
    extraHours: 845.00,
    deductions: 1180.00,
    netSalary: 7165.00,
    createdAt: '28/02/2024'
  }
]

const months = [
  { value: '3/2024', label: 'Março/2024' },
  { value: '2/2024', label: 'Fevereiro/2024' },
]

export default function HoleritesPage() {
  const [selectedMonth, setSelectedMonth] = useState('3/2024')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewHolerite, setViewHolerite] = useState(false)
  const [selectedHolerite, setSelectedHolerite] = useState<Holerite | null>(null)
  // Filtra holerites com base no mês selecionado e no termo de busca
  const filteredHolerites = holerites.filter(holerite => 
    holerite.month === selectedMonth && 
    holerite.employee.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Visualiza o holerite selecionado
  const handleViewHolerite = (holerite: Holerite) => {
    setSelectedHolerite(holerite)
    setViewHolerite(true)
  }

  // Gera um novo holerite para os funcionários pendentes
  const handleGenerateHolerite = () => {
    // Aqui entraria a lógica para gerar holerites
    alert('Holerites gerados com sucesso para funcionários pendentes!')
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
          <Button onClick={handleGenerateHolerite}>
            <Plus className="mr-2 h-4 w-4" />
            Gerar Holerites
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Mês/Ano</TableHead>
              <TableHead>Data Geração</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Salário Líquido</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHolerites.length > 0 ? (
              filteredHolerites.map((holerite) => (
                <TableRow key={holerite.id}>
                  <TableCell className="font-medium">{holerite.employee}</TableCell>
                  <TableCell>{holerite.month.replace('/', '/')}</TableCell>
                  <TableCell>{holerite.createdAt}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      holerite.status === 'Gerado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {holerite.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {holerite.netSalary.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewHolerite(holerite)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <DownloadCloud className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum holerite encontrado para o período selecionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para visualização do holerite */}
      <Dialog open={viewHolerite} onOpenChange={setViewHolerite}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Holerite - {selectedHolerite?.employee}</DialogTitle>
            <DialogDescription>
              Referente a {selectedHolerite?.month.replace('/', '/')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedHolerite && (
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-lg">Empresa ACME Ltda.</h3>
                  <p className="text-sm">CNPJ: 12.345.678/0001-90</p>
                  <p className="text-sm">Rua Exemplo, 123 - São Paulo/SP</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold">RECIBO DE PAGAMENTO</h3>
                  <p className="text-sm">
                    {selectedHolerite.month === '3/2024' 
                      ? 'Março/2024' 
                      : selectedHolerite.month === '2/2024' 
                        ? 'Fevereiro/2024' 
                        : 'Janeiro/2024'}
                  </p>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Dados do Funcionário</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm"><strong>Nome:</strong> {selectedHolerite.employee}</p>
                    <p className="text-sm"><strong>Cargo:</strong> {selectedHolerite.position}</p>
                    <p className="text-sm"><strong>Departamento:</strong> {selectedHolerite.department}</p>
                  </div>
                  <div>
                    <p className="text-sm"><strong>Matrícula:</strong> {1000 + selectedHolerite.id}</p>
                    <p className="text-sm"><strong>Admissão:</strong> 01/01/2023</p>
                    <p className="text-sm"><strong>PIS:</strong> 123.45678.90-1</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Proventos e Descontos</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Referência</TableHead>
                      <TableHead className="text-right">Proventos</TableHead>
                      <TableHead className="text-right">Descontos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Salário Base</TableCell>
                      <TableCell className="text-right">30 dias</TableCell>
                      <TableCell className="text-right">
                        R$ {selectedHolerite.salary.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                    {selectedHolerite.extraHours > 0 && (
                      <TableRow>
                        <TableCell>Horas Extras</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right">
                          R$ {selectedHolerite.extraHours.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell className="text-right">-</TableCell>
                      </TableRow>
                    )}
                    
                    <TableRow>
                      <TableCell>INSS</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">
                        R$ {(selectedHolerite.deductions * 0.6).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell>IRRF</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">
                        R$ {(selectedHolerite.deductions * 0.4).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="font-bold">
                      <TableCell>Totais</TableCell>
                      <TableCell className="text-right">-</TableCell>
                      <TableCell className="text-right">
                        R$ {(selectedHolerite.salary + selectedHolerite.extraHours).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {selectedHolerite.deductions.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="mt-4 border-t pt-4 flex justify-between">
                  <div>
                    <p className="text-sm">
                      <strong>Base FGTS:</strong> 
                      R$ {(selectedHolerite.salary + selectedHolerite.extraHours).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-sm">
                      <strong>FGTS do mês:</strong> 
                      R$ {((selectedHolerite.salary + selectedHolerite.extraHours) * 0.08).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <strong>Total Bruto:</strong> 
                      R$ {(selectedHolerite.salary + selectedHolerite.extraHours).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-sm">
                      <strong>Descontos:</strong> 
                      R$ {selectedHolerite.deductions.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                    <p className="font-bold">
                      <strong>Líquido a Receber:</strong> 
                      R$ {selectedHolerite.netSalary.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2">
            <Button variant="outline">
              <DownloadCloud className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={() => setViewHolerite(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}