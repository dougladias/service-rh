'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Link from 'next/link'
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

// Tipos para benefícios
interface BenefitType {
  _id: string;
  name: string;
  description: string;
  hasDiscount: boolean;
  discountPercentage?: number;
  defaultValue: number;
  status: 'active' | 'inactive';
}

interface EmployeeBenefit {
  _id: string;
  employeeId: string;
  benefitTypeId: string;
  value: number;
  status: 'active' | 'inactive';
  benefitType?: BenefitType;
}

// Corrigir a interface Employee para corresponder à estrutura do MongoDB
interface Employee {
  _id: string;  // Alterado de 'id' para '_id'
  name: string;
  role: string;
  department: string;
  ajuda?: string; // Campo para ajuda de custo
}

// Primeiro, adicione este CSS em algum lugar do seu arquivo ou em um arquivo CSS global
// Este CSS remove as setas de incremento/decremento dos inputs de tipo number
const inputStyles = `
  /* Remover setas de input number - Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Remover setas de input number - Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

export default function BeneficiosPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('funcionarios')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [isEditingEmployee, setIsEditingEmployee] = useState(false)
  const [newBenefit, setNewBenefit] = useState({
    benefitTypeId: '',
    value: 0
  })

  // Adicionar novos estados para o modal de novo tipo de benefício
  const [isNewBenefitTypeModalOpen, setIsNewBenefitTypeModalOpen] = useState(false)
  const [newBenefitType, setNewBenefitType] = useState({
    name: '',
    description: '',
    defaultValue: 0,
    hasDiscount: false,
    discountPercentage: 6 // Valor padrão para VT (6%)
  })

  // Estados para edição de tipo de benefício
  const [isEditingBenefitType, setIsEditingBenefitType] = useState(false)
  const [editingBenefitType, setEditingBenefitType] = useState<BenefitType | null>(null)

  // Adicione este estado para armazenar os valores sendo editados
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  // Buscar tipos de benefícios
  const {
    data: benefitTypes = [],
    isLoading: isLoadingTypes,
    error: benefitTypesError
  } = useQuery<BenefitType[]>({
    queryKey: ['benefitTypes'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/benefit-types')
        console.log('Benefit Types Response:', response.data)
        return response.data
      } catch (error) {
        console.error('Error fetching benefit types:', error)
        throw error
      }
    },
    retry: 2
  })

  // Buscar funcionários
  const {
    data: employees = [],
    isLoading: isLoadingEmployees
  } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => axios.get('/api/workers').then(res => res.data)
  })

  // Buscar TODOS os benefícios ativos, não apenas do funcionário selecionado
  const {
    data: allEmployeeBenefits = [],
    isLoading: isLoadingAllBenefits
  } = useQuery<EmployeeBenefit[]>({
    queryKey: ['allEmployeeBenefits'],
    queryFn: () => axios.get('/api/employee-benefits-all').then(res => res.data),
  })

  // Buscar benefícios do funcionário selecionado (mantido para a edição de benefícios individuais)
  const {
    data: employeeBenefits = []
  } = useQuery<EmployeeBenefit[]>({
    queryKey: ['employeeBenefits', selectedEmployee],
    queryFn: () => selectedEmployee
      ? axios.get(`/api/employee-benefits?employeeId=${selectedEmployee}`)
        .then(res => res.data)
      : Promise.resolve([]),
    enabled: !!selectedEmployee
  })

  // NOVO: Sincronizar ajuda de custo como benefício
  useEffect(() => {
    // Sincronizar ajuda de custo como benefício
    const syncAjudaDeCusto = async () => {
      if (!employees.length || !benefitTypes.length) return;
      
      // Encontrar o tipo de benefício "Ajuda de Custo" (ou criar se não existir)
      let ajudaDeCustoBenefitType = benefitTypes.find(type => 
        type.name.toLowerCase() === 'ajuda de custo');
      
      if (!ajudaDeCustoBenefitType) {
        try {
          // Se não existir, criar o tipo de benefício
          const response = await axios.post('/api/benefit-types', {
            name: 'Ajuda de Custo',
            description: 'Ajuda de custo para funcionários',
            hasDiscount: false,
            defaultValue: 0,
            status: 'active'
          });
          ajudaDeCustoBenefitType = response.data;
          
          // Forçar atualização dos tipos de benefício
          queryClient.invalidateQueries({ queryKey: ['benefitTypes'] });
        } catch (error) {
          console.error('Erro ao criar tipo de benefício para Ajuda de Custo:', error);
          return;
        }
      }
      
      // Para cada funcionário que tenha ajuda de custo
      for (const employee of employees) {
        if (employee.ajuda && parseFloat(employee.ajuda) > 0) {
          // Verificar com mais precisão se o benefício já existe
          const existingAjudaBenefit = await axios.get('/api/employee-benefits', {
            params: { 
              employeeId: employee._id,
              status: 'active'
            }
          }).then(res => {
            // Add null check before accessing _id
            const benefits: EmployeeBenefit[] = res.data;
            return benefits.find(b => 
              ajudaDeCustoBenefitType && b.benefitTypeId === ajudaDeCustoBenefitType._id
            );
          });
          
          // Se não existe, criar o benefício
          if (!existingAjudaBenefit && ajudaDeCustoBenefitType) {
            try {
              await axios.post('/api/employee-benefits', {
                employeeId: employee._id,
                benefitTypeId: ajudaDeCustoBenefitType._id,
                value: parseFloat(employee.ajuda),
                status: 'active'
              });
              
              // Atualizar a lista de benefícios
              queryClient.invalidateQueries({ queryKey: ['allEmployeeBenefits'] });
            } catch (error) {
              console.error(`Erro ao criar benefício de Ajuda de Custo para funcionário ${employee.name}:`, error);
            }
          } 
          // Se existe, mas o valor está diferente, atualizar
          else if (existingAjudaBenefit && parseFloat(employee.ajuda) !== existingAjudaBenefit.value) {
            try {
              await axios.put(`/api/employee-benefits?id=${existingAjudaBenefit._id}`, {
                value: parseFloat(employee.ajuda)
              });
              
              // Atualizar a lista de benefícios
              queryClient.invalidateQueries({ queryKey: ['allEmployeeBenefits'] });
            } catch (error) {
              console.error(`Erro ao atualizar benefício de Ajuda de Custo para funcionário ${employee.name}:`, error);
            }
          }
        }
      }
    };
    
    // Executar a sincronização
    syncAjudaDeCusto();
  }, [employees, benefitTypes, allEmployeeBenefits, queryClient]);

  // Mutation para adicionar benefício
  const addBenefitMutation = useMutation({
    mutationFn: (benefitData: { benefitTypeId: string; value: number; status: string }) =>
      axios.post('/api/employee-benefits', {
        ...benefitData,
        employeeId: selectedEmployee
      }),
    onSuccess: () => {
      // Invalida e recarrega os benefícios do funcionário E todos os benefícios
      queryClient.invalidateQueries({
        queryKey: ['employeeBenefits', selectedEmployee]
      })
      queryClient.invalidateQueries({
        queryKey: ['allEmployeeBenefits']
      })

      // Reseta o novo benefício
      setNewBenefit({ benefitTypeId: '', value: 0 })
    },
    onError: (error) => {
      console.error('Erro ao adicionar benefício:', error)
      alert('Erro ao adicionar benefício')
    }
  })

  // Mutation para remover benefício
  const removeBenefitMutation = useMutation({
    mutationFn: (benefitId: string) =>
      axios.delete(`/api/employee-benefits?id=${benefitId}`),
    onSuccess: () => {
      // Invalida e recarrega os benefícios do funcionário E todos os benefícios
      queryClient.invalidateQueries({
        queryKey: ['employeeBenefits', selectedEmployee]
      })
      queryClient.invalidateQueries({
        queryKey: ['allEmployeeBenefits']
      })
    },
    onError: (error) => {
      console.error('Erro ao remover benefício:', error)
      alert('Erro ao remover benefício')
    }
  })

  // Mutation para atualizar benefício
  const updateBenefitMutation = useMutation({
    mutationFn: (params: { benefitId: string; updateData: { value?: number; status?: 'active' | 'inactive' } }) =>
      axios.put(`/api/employee-benefits?id=${params.benefitId}`, params.updateData),
    onSuccess: () => {
      // Invalida e recarrega os benefícios do funcionário E todos os benefícios
      queryClient.invalidateQueries({
        queryKey: ['employeeBenefits', selectedEmployee]
      })
      queryClient.invalidateQueries({
        queryKey: ['allEmployeeBenefits']
      })
    },
    onError: (error) => {
      console.error('Erro ao atualizar benefício:', error)
      alert('Erro ao atualizar benefício')
    }
  })

  // Mutation para criar um novo tipo de benefício
  const createBenefitTypeMutation = useMutation({
    mutationFn: (data: Omit<BenefitType, '_id' | 'status'>) =>
      axios.post('/api/benefit-types', { ...data, status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitTypes'] })
      setIsNewBenefitTypeModalOpen(false)
      // Resetar o formulário
      setNewBenefitType({
        name: '',
        description: '',
        defaultValue: 0,
        hasDiscount: false,
        discountPercentage: 6
      })
    },
    onError: (error) => {
      console.error('Erro ao criar tipo de benefício:', error)
      alert('Erro ao criar tipo de benefício. Verifique o console para mais detalhes.')
    }
  })

  // Mutation para atualizar tipo de benefício
  const updateBenefitTypeMutation = useMutation({
    mutationFn: (params: { benefitTypeId: string; updateData: Partial<BenefitType> }) =>
      axios.put(`/api/benefit-types?id=${params.benefitTypeId}`, params.updateData),
    onSuccess: () => {
      // Invalida e recarrega os tipos de benefícios
      queryClient.invalidateQueries({
        queryKey: ['benefitTypes']
      })
      setIsEditingBenefitType(false)
      setEditingBenefitType(null)
    },
    onError: (error) => {
      console.error('Erro ao atualizar tipo de benefício:', error)
      alert('Erro ao atualizar tipo de benefício')
    }
  })

  // Ícone para o tipo de benefício
  const getBenefitIcon = (benefitTypeName: string) => {
    const iconMap: Record<string, typeof Bus> = {
      'Vale Transporte': Bus,
      'Vale Refeição': Utensils,
      'Vale Alimentação': Coffee,
      'Plano de Saúde': Heart,
      'Auxílio Educação': GraduationCap,
      'Ajuda de Custo': Gift // Adicione outros benefícios aqui
    };
    return iconMap[benefitTypeName] || Gift; // Ícone padrão
  };

  // Filtra funcionários com base no termo de busca
  const filteredEmployees = useMemo(() =>
    employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [employees, searchTerm]
  )

  // Agrupa os benefícios por funcionário para fácil acesso
  const benefitsByEmployee = useMemo(() => {
    const benefitsMap: Record<string, EmployeeBenefit[]> = {};
    
    allEmployeeBenefits.forEach(benefit => {
      if (!benefitsMap[benefit.employeeId]) {
        benefitsMap[benefit.employeeId] = [];
      }
      benefitsMap[benefit.employeeId].push(benefit);
    });
    
    return benefitsMap;
  }, [allEmployeeBenefits]);

  // Função para editar benefícios de um funcionário
  const handleEditEmployeeBenefits = (employeeId: string) => {
    setSelectedEmployee(employeeId)
    setIsEditingEmployee(true)
  }

  // Função para adicionar novo benefício
  const handleAddBenefit = () => {
    if (!selectedEmployee || !newBenefit.benefitTypeId) {
      alert('Por favor, selecione um tipo de benefício')
      return
    }

    const selectedBenefitType = benefitTypes.find(
      type => type._id === newBenefit.benefitTypeId
    )

    addBenefitMutation.mutate({
      benefitTypeId: newBenefit.benefitTypeId,
      value: newBenefit.value || selectedBenefitType?.defaultValue || 0,
      status: 'active'
    })
  }

  // Função para remover benefício
  const handleRemoveBenefit = (benefitId: string) => {
    if (window.confirm('Tem certeza que deseja remover este benefício?')) {
      removeBenefitMutation.mutate(benefitId)
    }
  }

  // Função para adicionar novo tipo de benefício
  const handleAddBenefitType = () => {
    // Validações básicas
    if (!newBenefitType.name.trim()) {
      alert('O nome do benefício é obrigatório')
      return
    }

    if (newBenefitType.defaultValue <= 0) {
      alert('O valor padrão deve ser maior que zero')
      return
    }

    // Preparar os dados para envio
    const dataToSend = {
      ...newBenefitType,
      // Se não tiver desconto, não envia a porcentagem
      ...(newBenefitType.hasDiscount ? {} : { discountPercentage: undefined })
    }

    createBenefitTypeMutation.mutate(dataToSend)
  }

  // Função para editar tipo de benefício
  const handleEditBenefitType = (benefitType: BenefitType) => {
    setEditingBenefitType(benefitType)
    setIsEditingBenefitType(true)
  }

  // Função para atualizar status do tipo de benefício
  const handleUpdateBenefitTypeStatus = (benefitTypeId: string, newStatus: 'active' | 'inactive') => {
    updateBenefitTypeMutation.mutate({
      benefitTypeId,
      updateData: { status: newStatus }
    })
  }

  // Adicione esta função para gerenciar a mudança no valor
  const handleBenefitValueChange = (benefitId: string, value: string) => {
    // Armazenar o valor sendo editado
    setEditingValues(prev => ({
      ...prev,
      [benefitId]: value
    }));
  };

  // Substitua a função handleBenefitValueBlur existente por esta versão aprimorada
const handleBenefitValueBlur = (benefit: EmployeeBenefit) => {
  const newValue = editingValues[benefit._id];
  
  // Se não houver valor editado ou for o mesmo valor, não faz nada
  if (newValue === undefined || parseFloat(newValue) === benefit.value) {
    return;
  }
  
  // Converter para número e verificar se é válido
  const numericValue = parseFloat(newValue);
  if (isNaN(numericValue)) {
    // Se não for um número válido, reverter para o valor original
    setEditingValues(prev => ({
      ...prev,
      [benefit._id]: benefit.value.toString()
    }));
    return;
  }
  
  // Aplica a mudança com callback de sucesso
  updateBenefitMutation.mutate(
    {
      benefitId: benefit._id,
      updateData: { 
        value: numericValue
      }
    },
    {
      onSuccess: (data) => {
        // Após sucesso, atualiza o estado editingValues com o novo valor confirmado
        console.log('Benefício atualizado com sucesso:', data);
        
        // Isso é importante: atualizar o cache do React Query com o valor atualizado
        queryClient.setQueryData(
          ['employeeBenefits', selectedEmployee],
          (oldData: EmployeeBenefit[] | undefined) => {
            if (!oldData) return undefined;
            
            return oldData.map(b => 
              b._id === benefit._id ? { ...b, value: numericValue } : b
            );
          }
        );
        
        queryClient.setQueryData(
          ['allEmployeeBenefits'],
          (oldData: EmployeeBenefit[] | undefined) => {
            if (!oldData) return undefined;
            
            return oldData.map(b => 
              b._id === benefit._id ? { ...b, value: numericValue } : b
            );
          }
        );
      },
      onError: (error) => {
        console.error('Erro ao atualizar benefício:', error);
        // Reverta para o valor original em caso de erro
        setEditingValues(prev => ({
          ...prev,
          [benefit._id]: benefit.value.toString()
        }));
        alert('Erro ao atualizar o benefício. Tente novamente.');
      }
    }
  );
};

  // Efeito para log de erro
  useEffect(() => {
    if (benefitTypesError) {
      console.error('Erro ao buscar tipos de benefícios:', benefitTypesError)
    }
  }, [benefitTypesError])

  return (
    <div className="space-y-6 p-6">
      {/* Adicione o CSS inline */}
      <style>{inputStyles}</style>
      
      <div className="flex items-center gap-2 mb-8">
        <Link href="/dashboard/folha-pagamento">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Benefícios Ativos</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingEmployees || isLoadingAllBenefits ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Carregando funcionários e benefícios...
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Nenhum funcionário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((emp) => {
                      // Obter os benefícios deste funcionário do mapa agrupado
                      const employeeBenefitsList = benefitsByEmployee[emp._id] || [];
                      
                      // Filtrar apenas os benefícios ativos
                      const activeBenefits = employeeBenefitsList.filter(
                        b => b.status === 'active'
                      );

                      return (
                        <TableRow key={emp._id}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.role}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {activeBenefits.map((benefit) => {
                                const BenefitIcon = getBenefitIcon(benefit.benefitType?.name || '');
                                return (
                                  <div key={benefit._id} className="inline-flex items-center bg-muted px-2 py-1 rounded-md text-xs">
                                    <BenefitIcon className="mr-1 h-3 w-3" />
                                    <span>{benefit.benefitType?.name || 'Desconhecido'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            R$ {activeBenefits
                              .reduce((total, b) => total + b.value, 0)
                              .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditEmployeeBenefits(emp._id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
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
              <Button onClick={() => setIsNewBenefitTypeModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Benefício
              </Button>
            </CardHeader>
            <CardContent className="px-0">
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
                  {isLoadingTypes ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Carregando tipos de benefícios...
                      </TableCell>
                    </TableRow>
                  ) : (
                    benefitTypes.map((benefit) => {
                      const BenefitIcon = getBenefitIcon(benefit.name)
                      return (
                        <TableRow key={benefit._id}>
                          <TableCell>
                            <div className="flex items-center">
                              <BenefitIcon className="mr-2 h-4 w-4" />
                              <span className="font-medium">{benefit.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{benefit.description}</TableCell>
                          <TableCell className="text-right">
                            R$ {benefit.defaultValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                              <Switch
                                id={`status-${benefit._id}`}
                                checked={benefit.status === 'active'}
                                onCheckedChange={(checked) => 
                                  handleUpdateBenefitTypeStatus(
                                    benefit._id, 
                                    checked ? 'active' : 'inactive'
                                  )
                                }
                              />
                              <Label htmlFor={`status-${benefit._id}`}>
                                {benefit.status === 'active' ? 'Ativo' : 'Inativo'}
                              </Label>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditBenefitType(benefit)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para editar benefícios do funcionário */}
      <Dialog open={isEditingEmployee} onOpenChange={setIsEditingEmployee}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Editar Benefícios - {employees.find(e => e._id === selectedEmployee)?.name}
            </DialogTitle>
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
                    <p>
                      <span className="text-muted-foreground">Nome:</span>{' '}
                      {employees.find(e => e._id === selectedEmployee)?.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Cargo:</span>{' '}
                      {employees.find(e => e._id === selectedEmployee)?.role}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Adicionar Novo Benefício</h3>
                  <div className="flex space-x-2">
                    <Select
                      value={newBenefit.benefitTypeId}
                      onValueChange={(value) => setNewBenefit(prev => ({
                        ...prev,
                        benefitTypeId: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um benefício" />
                      </SelectTrigger>
                      <SelectContent>
                        {benefitTypes
                          // Filtra tipos de benefícios que o funcionário ainda não possui
                          .filter(type =>
                            !employeeBenefits.some(
                              eb => eb.benefitTypeId === type._id && eb.status === 'active'
                            )
                          )
                          .map(type => (
                            <SelectItem key={type._id} value={type._id}>
                              {type.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Valor"
                      className="w-24"
                      value={newBenefit.value || ''}
                      onChange={(e) => setNewBenefit(prev => ({
                        ...prev,
                        value: parseFloat(e.target.value) || 0
                      }))}
                    />
                    <Button
                      onClick={handleAddBenefit}
                      disabled={!newBenefit.benefitTypeId}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Benefícios Atuais</CardTitle>
                  <CardDescription>
                    Benefícios com tag &quot;Auto&quot; são sincronizados automaticamente com o campo &quot;Ajuda&quot; do funcionário
                  </CardDescription>
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
                      {employeeBenefits
                        .filter(b => b.employeeId === selectedEmployee)
                        .map((benefit) => {
                          const BenefitIcon = getBenefitIcon(benefit.benefitType?.name || '')
                          // Verificar se este é um benefício de "Ajuda de Custo" (para permitir edição mas mostrar origem)
                          const isAjudaDeCusto = benefit.benefitType?.name.toLowerCase() === 'ajuda de custo';
                          return (
                            <TableRow key={benefit._id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <BenefitIcon className="mr-2 h-4 w-4" />
                                  <span>{benefit.benefitType?.name}</span>
                                  {isAjudaDeCusto && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      Auto
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="text" // Mudado de "number" para "text"
                                  value={editingValues[benefit._id] !== undefined 
                                    ? editingValues[benefit._id] 
                                    : benefit.value.toString()}
                                  onChange={(e) => handleBenefitValueChange(benefit._id, e.target.value)}
                                  onBlur={() => handleBenefitValueBlur(benefit)}
                                  onKeyDown={(e) => {
                                    // Aplica a mudança quando o usuário pressiona Enter
                                    if (e.key === 'Enter') {
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  className="w-28 ml-auto text-right"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`benefit-status-${benefit._id}`}
                                    checked={benefit.status === 'active'}
                                    onCheckedChange={(checked) =>
                                      updateBenefitMutation.mutate({
                                        benefitId: benefit._id,
                                        updateData: {
                                          status: checked ? 'active' : 'inactive'
                                        }
                                      })
                                    }
                                  />
                                  <Label htmlFor={`benefit-status-${benefit._id}`}>
                                    {benefit.status === 'active' ? 'Ativo' : 'Inativo'}
                                  </Label>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveBenefit(benefit._id)}
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
            <Button onClick={() => setIsEditingEmployee(false)}>
              <SaveIcon className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar novo tipo de benefício */}
      <Dialog open={isNewBenefitTypeModalOpen} onOpenChange={setIsNewBenefitTypeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Tipo de Benefício</DialogTitle>
            <DialogDescription>
              Crie um novo tipo de benefício para seus funcionários
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="benefit-name">Nome do Benefício</Label>
              <Input
                id="benefit-name"
                value={newBenefitType.name}
                onChange={(e) => setNewBenefitType(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="Ex: Vale Transporte"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefit-description">Descrição</Label>
              <Input
                id="benefit-description"
                value={newBenefitType.description}
                onChange={(e) => setNewBenefitType(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Uma breve descrição do benefício"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefit-value">Valor Padrão (R$)</Label>
              <Input
                id="benefit-value"
                type="number"
                value={newBenefitType.defaultValue || ''}
                onChange={(e) => setNewBenefitType(prev => ({
                  ...prev,
                  defaultValue: parseFloat(e.target.value) || 0
                }))}
                placeholder="Valor padrão do benefício"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="has-discount"
                checked={newBenefitType.hasDiscount}
                onCheckedChange={(checked) => setNewBenefitType(prev => ({
                  ...prev,
                  hasDiscount: checked
                }))}
              />
              <Label htmlFor="has-discount">Desconto em Folha</Label>
            </div>

            {newBenefitType.hasDiscount && (
              <div className="space-y-2">
                <Label htmlFor="discount-percentage">Percentual de Desconto (%)</Label>
                <Input
                  id="discount-percentage"
                  type="number"
                  value={newBenefitType.discountPercentage || ''}
                  onChange={(e) => setNewBenefitType(prev => ({
                    ...prev,
                    discountPercentage: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="Percentual de desconto"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewBenefitTypeModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddBenefitType}
              disabled={createBenefitTypeMutation.isPending}
            >
              {createBenefitTypeMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar tipo de benefício */}
      <Dialog open={isEditingBenefitType} onOpenChange={setIsEditingBenefitType}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Benefício</DialogTitle>
            <DialogDescription>
              Atualize as informações deste tipo de benefício
            </DialogDescription>
          </DialogHeader>

          {editingBenefitType && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-benefit-name">Nome do Benefício</Label>
                <Input
                  id="edit-benefit-name"
                  value={editingBenefitType.name}
                  onChange={(e) => setEditingBenefitType({
                    ...editingBenefitType,
                    name: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-benefit-description">Descrição</Label>
                <Input
                  id="edit-benefit-description"
                  value={editingBenefitType.description}
                  onChange={(e) => setEditingBenefitType({
                    ...editingBenefitType,
                    description: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-benefit-value">Valor Padrão (R$)</Label>
                <Input
                  id="edit-benefit-value"
                  type="number"
                  value={editingBenefitType.defaultValue}
                  onChange={(e) => setEditingBenefitType({
                    ...editingBenefitType,
                    defaultValue: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-has-discount"
                  checked={editingBenefitType.hasDiscount}
                  onCheckedChange={(checked) => setEditingBenefitType({
                    ...editingBenefitType,
                    hasDiscount: checked,
                    // Se desabilitar o desconto, zera a porcentagem
                    ...(checked ? {} : { discountPercentage: 0 })
                  })}
                />
                <Label htmlFor="edit-has-discount">Desconto em Folha</Label>
              </div>

              {editingBenefitType.hasDiscount && (
                <div className="space-y-2">
                  <Label htmlFor="edit-discount-percentage">Percentual de Desconto (%)</Label>
                  <Input
                    id="edit-discount-percentage"
                    type="number"
                    value={editingBenefitType.discountPercentage || 0}
                    onChange={(e) => setEditingBenefitType({
                      ...editingBenefitType,
                      discountPercentage: parseFloat(e.target.value) || 0
                    })}
                    placeholder="Percentual de desconto"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-status"
                  checked={editingBenefitType.status === 'active'}
                  onCheckedChange={(checked) => setEditingBenefitType({
                    ...editingBenefitType,
                    status: checked ? 'active' : 'inactive'
                  })}
                />
                <Label htmlFor="edit-status">
                  {editingBenefitType.status === 'active' ? 'Ativo' : 'Inativo'}
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditingBenefitType(false);
              setEditingBenefitType(null);
            }}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editingBenefitType) {
                  updateBenefitTypeMutation.mutate({
                    benefitTypeId: editingBenefitType._id,
                    updateData: {
                      name: editingBenefitType.name,
                      description: editingBenefitType.description,
                      defaultValue: editingBenefitType.defaultValue,
                      hasDiscount: editingBenefitType.hasDiscount,
                      discountPercentage: editingBenefitType.hasDiscount 
                        ? editingBenefitType.discountPercentage 
                        : undefined,
                      status: editingBenefitType.status
                    }
                  });
                }
              }}
              disabled={updateBenefitTypeMutation.isPending}
            >
              {updateBenefitTypeMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}