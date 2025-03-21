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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Switch 
} from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  Bus,
  Utensils,
  Heart,
  GraduationCap,
  Gift,
  Coffee,
  SaveIcon
} from 'lucide-react'
import Link from 'next/link'

// Define interfaces for our data types
interface Benefit {
  type: string;
  value: number;
  status: string;
}

interface Employee {
  id: number;
  employee: string;
  position: string;
  department: string;
  benefits: Benefit[];
}

// Dados de exemplo para os benefícios
const employeeBenefits: Employee[] = [
  { 
    id: 1,
    employee: 'Maria Silva',
    position: 'Desenvolvedora',
    department: 'TI',
    benefits: [
      { type: 'Vale Transporte', value: 220.00, status: 'Ativo' },
      { type: 'Vale Refeição', value: 880.00, status: 'Ativo' },
      { type: 'Plano de Saúde', value: 350.00, status: 'Ativo' },
      { type: 'Auxílio Educação', value: 300.00, status: 'Ativo' }
    ]
  },
  { 
    id: 2,
    employee: 'João Costa',
    position: 'Designer',
    department: 'Marketing',
    benefits: [
      { type: 'Vale Transporte', value: 180.00, status: 'Ativo' },
      { type: 'Vale Refeição', value: 880.00, status: 'Ativo' },
      { type: 'Plano de Saúde', value: 350.00, status: 'Ativo' }
    ]
  },
  { 
    id: 3,
    employee: 'Ana Oliveira',
    position: 'Analista Financeiro',
    department: 'Financeiro',
    benefits: [
      { type: 'Vale Refeição', value: 880.00, status: 'Ativo' },
      { type: 'Plano de Saúde', value: 350.00, status: 'Ativo' },
      { type: 'Auxílio Educação', value: 450.00, status: 'Ativo' }
    ]
  }
]

const benefitTypes = [
  { id: 1, name: 'Vale Transporte', icon: Bus, defaultValue: 220.00, description: 'Auxílio para transporte público', hasDiscount: true, discountPercentage: 6 },
  { id: 2, name: 'Vale Refeição', icon: Utensils, defaultValue: 880.00, description: 'Auxílio para alimentação', hasDiscount: false },
  { id: 3, name: 'Vale Alimentação', icon: Coffee, defaultValue: 600.00, description: 'Auxílio para compras em supermercados', hasDiscount: false },
  { id: 4, name: 'Plano de Saúde', icon: Heart, defaultValue: 350.00, description: 'Assistência médica', hasDiscount: true, discountPercentage: 20 },
  { id: 5, name: 'Auxílio Educação', icon: GraduationCap, defaultValue: 300.00, description: 'Auxílio para cursos e qualificações', hasDiscount: false }
]

export default function BeneficiosPage() {
  const [activeTab, setActiveTab] = useState('funcionarios')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEditingEmployee, setIsEditingEmployee] = useState(false)
  const [newBenefit, setNewBenefit] = useState({ type: '', value: 0 })
  
  // Filtra funcionários com base no termo de busca
  const filteredEmployees = employeeBenefits.filter(emp => 
    emp.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Função para editar benefícios de um funcionário
  const handleEditEmployeeBenefits = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEditingEmployee(true)
  }
  
  // Função para adicionar novo benefício ao funcionário
  const handleAddBenefit = () => {
    if (selectedEmployee && newBenefit.type) {
      const benefitType = benefitTypes.find(b => b.name === newBenefit.type)
      if (benefitType) {
        setSelectedEmployee({
          ...selectedEmployee,
          benefits: [
            ...selectedEmployee.benefits,
            { 
              type: newBenefit.type, 
              value: newBenefit.value || benefitType.defaultValue, 
              status: 'Ativo' 
            }
          ]
        })
        setNewBenefit({ type: '', value: 0 })
      }
    }
  }
  
  // Função para remover um benefício do funcionário
  const handleRemoveBenefit = (benefitType: string) => {
    if (selectedEmployee) {
      setSelectedEmployee({
        ...selectedEmployee,
        benefits: selectedEmployee.benefits.filter((b: Benefit) => b.type !== benefitType)
      })
    }
  }
  
  // Função para salvar os benefícios do funcionário
  const handleSaveEmployeeBenefits = () => {
    // Aqui você implementaria a lógica para salvar no backend
    if (selectedEmployee) {
      alert(`Benefícios atualizados para ${selectedEmployee.employee}`)
    }
    setIsEditingEmployee(false)
  }
  
  // Ícone para o tipo de benefício
  const getBenefitIcon = (benefitType: string) => {
    const benefit = benefitTypes.find(b => b.name === benefitType)
    return benefit ? benefit.icon : Gift
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/folha-pagamento">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Benefícios</h1>
          <p className="text-muted-foreground">Gerenciamento de benefícios para funcionários</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="funcionarios">Por Funcionário</TabsTrigger>
          <TabsTrigger value="beneficios">Tipos de Benefícios</TabsTrigger>
        </TabsList>
        
        {/* Aba de Benefícios por Funcionário */}
        <TabsContent value="funcionarios" className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-80">
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
          
          <Card>
            <CardHeader>
              <CardTitle>Benefícios por Funcionário</CardTitle>
              <CardDescription>
                Visualize e gerencie os benefícios concedidos a cada funcionário
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Benefícios Ativos</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.employee}</TableCell>
                        <TableCell>{emp.position}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {emp.benefits.map((benefit, index) => {
                              const BenefitIcon = getBenefitIcon(benefit.type)
                              return (
                                <div 
                                  key={index} 
                                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                                  title={`${benefit.type}: R$ ${benefit.value.toFixed(2)}`}
                                >
                                  <BenefitIcon className="mr-1 h-3 w-3" />
                                  {benefit.type}
                                </div>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {emp.benefits.reduce((total, b) => total + b.value, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditEmployeeBenefits(emp)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Tipos de Benefícios */}
        <TabsContent value="beneficios" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tipos de Benefícios</CardTitle>
                <CardDescription>
                  Gerencie os tipos de benefícios disponíveis na empresa
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Benefício
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Benefício</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor Padrão</TableHead>
                      <TableHead>Desconto em Folha</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benefitTypes.map((benefit) => {
                      const BenefitIcon = benefit.icon
                      return (
                        <TableRow key={benefit.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <BenefitIcon className="mr-2 h-4 w-4" />
                              <span className="font-medium">{benefit.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{benefit.description}</TableCell>
                          <TableCell className="text-right">
                            R$ {benefit.defaultValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </TableCell>
                          <TableCell>
                            {benefit.hasDiscount ? (
                              <div className="flex items-center">
                                <span className="inline-block w-10 text-right mr-2">
                                  {benefit.discountPercentage}%
                                </span>
                                <div className="text-xs text-muted-foreground">
                                  {benefit.name === 'Vale Transporte' ? 'do salário' : 'do valor'}
                                </div>
                              </div>
                            ) : 'Não'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch id={`status-${benefit.id}`} defaultChecked />
                              <Label htmlFor={`status-${benefit.id}`}>Ativo</Label>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-2">
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal para editar benefícios do funcionário */}
      <Dialog open={isEditingEmployee} onOpenChange={setIsEditingEmployee}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Benefícios - {selectedEmployee?.employee}</DialogTitle>
            <DialogDescription>
              Adicione ou remova benefícios para este funcionário
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Informações do Funcionário</h3>
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">Nome:</span> {selectedEmployee.employee}</p>
                    <p><span className="text-muted-foreground">Cargo:</span> {selectedEmployee.position}</p>
                    <p><span className="text-muted-foreground">Departamento:</span> {selectedEmployee.department}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Adicionar Novo Benefício</h3>
                  <div className="flex space-x-2">
                    <Select 
                      value={newBenefit.type} 
                      onValueChange={(value) => setNewBenefit({...newBenefit, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um benefício" />
                      </SelectTrigger>
                      <SelectContent>
                        {benefitTypes
                          .filter(b => !selectedEmployee.benefits.some((eb: Benefit) => eb.type === b.name))
                          .map(benefit => (
                            <SelectItem key={benefit.id} value={benefit.name}>
                              {benefit.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddBenefit} disabled={!newBenefit.type}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Benefícios Atuais</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Benefício</TableHead>
                        <TableHead className="text-right">Valor (R$)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedEmployee.benefits.map((benefit: Benefit, index: number) => {
                        const BenefitIcon = getBenefitIcon(benefit.type)
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center">
                                <BenefitIcon className="mr-2 h-4 w-4" />
                                <span>{benefit.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Input 
                                type="number" 
                                value={benefit.value}
                                onChange={(e) => {
                                  const updatedBenefits = [...selectedEmployee.benefits];
                                  updatedBenefits[index].value = Number(e.target.value);
                                  setSelectedEmployee({
                                    ...selectedEmployee,
                                    benefits: updatedBenefits
                                  });
                                }}
                                step="0.01"
                                min="0"
                                className="w-28 ml-auto text-right"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id={`benefit-status-${index}`} 
                                  checked={benefit.status === 'Ativo'}
                                  onCheckedChange={(checked) => {
                                    const updatedBenefits = [...selectedEmployee.benefits];
                                    updatedBenefits[index].status = checked ? 'Ativo' : 'Inativo';
                                    setSelectedEmployee({
                                      ...selectedEmployee,
                                      benefits: updatedBenefits
                                    });
                                  }}
                                />
                                <Label htmlFor={`benefit-status-${index}`}>
                                  {benefit.status}
                                </Label>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRemoveBenefit(benefit.type)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingEmployee(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEmployeeBenefits}>
              <SaveIcon className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}