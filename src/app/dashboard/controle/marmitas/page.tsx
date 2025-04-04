"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { format, isToday, parseISO } from 'date-fns';
import {
    PlusCircle,
    Search,    
    Trash2,
    Coffee,
    UtensilsCrossed,
    Moon,
    Cookie,
    Calendar,    
    CheckCircle,
    X,
    AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,    
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    MealControl,
    MealRecord,
    MealControlService
} from '@/services/meal-control-service';

// Criar instância do serviço - use memoization para evitar recreação
const mealControlService = new MealControlService();

// Hook customizado para debounce
function useDebounce(value: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Componente principal da página
export default function MealControlPage() {
    const [activeTab, setActiveTab] = useState('employees');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag para carga inicial

    // Estado para armazenar os dados
    const [mealControls, setMealControls] = useState<MealControl[]>([]);
    const [filteredControls, setFilteredControls] = useState<MealControl[]>([]);
    const [workers, setWorkers] = useState<{_id: string; name: string}[]>([]);
    const [departments, setDepartments] = useState<{value: string; label: string}[]>([]);

    // Estado para formulários e modais
    const [showAddControlModal, setShowAddControlModal] = useState(false);
    const [showAddRecordModal, setShowAddRecordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedControl, setSelectedControl] = useState<MealControl | null>(null);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

    // Estado para filtros - aplique debounce na busca
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm);
    const [departmentFilter, setDepartmentFilter] = useState('all');

    // Estados para formulários - sem alterações
    const [mealControlForm, setMealControlForm] = useState({
        employeeId: '',
        hasMealAllowance: false,
        mealPlanType: 'daily',
        monthlyBudget: 0
    });

    const [mealRecordForm, setMealRecordForm] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        mealType: 'lunch',
        provided: true,
        cost: 0,
        notes: ''
    });

    // Estatísticas gerais - use useMemo para calcular apenas quando necessário
    const stats = useMemo(() => {
        if (mealControls.length === 0) {
            return {
                totalEmployees: 0,
                totalMealsToday: 0,
                totalMealsMonth: 0,
                totalCostMonth: 0
            };
        }
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let totalMealsToday = 0;
        let totalMealsMonth = 0;
        let totalCostMonth = 0;

        mealControls.forEach(control => {
            control.mealRecords.forEach(record => {
                const recordDate = parseISO(record.date as string);

                // Verificar se a refeição foi fornecida
                if (record.provided) {
                    // Contabilizar refeições de hoje
                    if (isToday(recordDate)) {
                        totalMealsToday++;
                    }

                    // Contabilizar refeições do mês atual
                    if (recordDate.getMonth() === currentMonth &&
                        recordDate.getFullYear() === currentYear) {
                        totalMealsMonth++;
                        totalCostMonth += record.cost || 0;
                    }
                }
            });
        });

        return {
            totalEmployees: mealControls.length,
            totalMealsToday,
            totalMealsMonth,
            totalCostMonth
        };
    }, [mealControls]); // Recalcule apenas quando mealControls mudar

    // Buscar funcionários sem controle de marmita - otimizado para evitar requisições desnecessárias
    const fetchAvailableWorkers = useCallback(async () => {
        // Carregar apenas quando o modal estiver aberto para criar novo controle
        if (!showAddControlModal) return;
        
        try {
            // Primeiro buscar todos os funcionários
            const workersResponse = await axios.get('/api/workers');
            const allWorkers = workersResponse.data;

            // Identificar funcionários que já têm controle de marmita
            const controlledEmployeeIds = mealControls.map(control => control.employeeId);

            // Filtrar para obter apenas funcionários sem controle
            const availableWorkers = allWorkers.filter(
                (worker: {_id: string; name: string}) => !controlledEmployeeIds.includes(worker._id)
            );

            setWorkers(availableWorkers);
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            setError('Não foi possível carregar a lista de funcionários');
        }
    }, [mealControls, showAddControlModal]); // Dependências reduzidas

    // Buscar departamentos - otimizado
    const fetchDepartments = useCallback(async () => {
        // Carregar apenas uma vez
        if (departments.length > 0) return;
        
        try {
            const response = await axios.get('/api/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Erro ao buscar departamentos:', error);
        }
    }, [departments.length]); // Dependência para evitar múltiplas requisições

    // Carregar dados iniciais - otimizado
    useEffect(() => {
        // Usar flag para garantir que a carga inicial ocorra apenas uma vez
        if (!isInitialLoad) return;
        
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Buscar controles de marmita
                const controls = await mealControlService.getMealControls();
                setMealControls(controls);
                setFilteredControls(controls);

                // Buscar outros dados necessários
                await fetchDepartments();
                
                setIsInitialLoad(false); // Marca que a carga inicial foi concluída
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setError('Falha ao carregar dados do sistema');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [fetchDepartments, isInitialLoad]); // Dependências reduzidas

    // Carregar workers quando o modal for aberto
    useEffect(() => {
        fetchAvailableWorkers();
    }, [fetchAvailableWorkers]);

    // Aplicar filtros - otimizado com debounce
    useEffect(() => {
        if (!mealControls.length) return;

        let filtered = [...mealControls];

        // Filtrar por texto de busca
        if (debouncedSearchTerm) {
            const term = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(control =>
                control.employeeName.toLowerCase().includes(term)
            );
        }

        // Filtrar por departamento
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(control =>
                control.department === departmentFilter
            );
        }

        setFilteredControls(filtered);
    }, [mealControls, debouncedSearchTerm, departmentFilter]); // Usar termo com debounce

    // Lógica de manipulação de eventos - otimizada para atualizar localmente quando possível
    const handleCreateMealControl = async () => {
        try {
            if (!mealControlForm.employeeId) {
                setError('Selecione um funcionário');
                return;
            }

            // Mostrar loading
            setIsLoading(true);
            
            const newControl = await mealControlService.createMealControl({
                employeeId: mealControlForm.employeeId,
                hasMealAllowance: mealControlForm.hasMealAllowance,
                mealPlanType: mealControlForm.mealPlanType as 'daily' | 'flexible' | 'none',
                monthlyBudget: mealControlForm.monthlyBudget
            });

            // Atualizar a lista de controles localmente
            setMealControls(prevControls => [...prevControls, newControl]);

            // Limpar o formulário
            setMealControlForm({
                employeeId: '',
                hasMealAllowance: false,
                mealPlanType: 'daily',
                monthlyBudget: 0
            });

            // Fechar o modal
            setShowAddControlModal(false);

            // Exibir mensagem de sucesso
            setSuccess('Controle de marmita criado com sucesso!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Erro ao criar controle de marmita:', error);
            setError('Falha ao criar controle de marmita');
        } finally {
            setIsLoading(false);
        }
    };

    // Adicionar um registro de marmita - otimizado
    const handleAddMealRecord = async () => {
        try {
            if (!selectedControl) {
                setError('Nenhum funcionário selecionado');
                return;
            }
            
            // Mostrar loading
            setIsLoading(true);

            const updatedControl = await mealControlService.addMealRecord(
                selectedControl._id as string,
                {
                    date: mealRecordForm.date,
                    mealType: mealRecordForm.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
                    provided: mealRecordForm.provided,
                    cost: mealRecordForm.cost,
                    notes: mealRecordForm.notes
                }
            );

            // Atualizar apenas o controle específico na lista
            setMealControls(prevControls => prevControls.map(control =>
                control._id === updatedControl._id ? updatedControl : control
            ));

            // Limpar formulário
            setMealRecordForm({
                date: format(new Date(), 'yyyy-MM-dd'),
                mealType: 'lunch',
                provided: true,
                cost: 0,
                notes: ''
            });

            // Fechar modal
            setShowAddRecordModal(false);

            // Exibir mensagem de sucesso
            setSuccess('Registro de marmita adicionado com sucesso!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Erro ao adicionar registro de marmita:', error);
            setError('Falha ao adicionar registro de marmita');
        } finally {
            setIsLoading(false);
        }
    };

    // Excluir um controle de marmita - otimizado
    const handleDeleteMealControl = async () => {
        try {
            if (!selectedControl) return;
            
            // Diferente ações com base no que está sendo excluído
            if (selectedRecordId) {
                // Excluir apenas um registro
                const controlId = selectedControl._id as string;
                const updatedControl = await mealControlService.deleteMealRecord(controlId, selectedRecordId);
                
                // Atualizar apenas o controle específico
                setMealControls(prevControls => prevControls.map(control =>
                    control._id === updatedControl._id ? updatedControl : control
                ));
                
                setSuccess('Registro de refeição excluído com sucesso!');
            } else {
                // Excluir o controle inteiro
                await mealControlService.deleteMealControl(selectedControl._id as string);
                
                // Atualizar removendo o controle da lista
                setMealControls(prevControls => prevControls.filter(
                    control => control._id !== selectedControl._id
                ));
                
                setSuccess('Controle de marmita excluído com sucesso!');
            }

            // Fechar o modal
            setShowDeleteModal(false);
            setSelectedControl(null);
            setSelectedRecordId(null);
            
            // Exibir mensagem de sucesso por 3 segundos
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Erro ao excluir:', error);
            setError('Falha ao excluir');
        }
    };

    // Atualizar um registro de marmita - otimizado
    const handleToggleMealProvided = async (control: MealControl, recordId: string, provided: boolean) => {
        if (!recordId) return;
        
        try {
            // Otimização: Atualizar o estado local imediatamente para UI responsiva
            const optimisticUpdateControls = mealControls.map(c => {
                if (c._id !== control._id) return c;
                
                return {
                    ...c,
                    mealRecords: c.mealRecords.map(record => {
                        if (!record._id || record._id.toString() !== recordId) return record;
                        return { ...record, provided };
                    })
                };
            });
            
            setMealControls(optimisticUpdateControls);
            
            // Enquanto isso, faz a atualização no servidor
            const updatedControl = await mealControlService.updateMealRecord(
                control._id as string,
                recordId,
                { provided }
            );

            // Caso a resposta do servidor seja diferente do esperado, atualiza o estado
            setMealControls(prevControls => prevControls.map(c =>
                c._id === updatedControl._id ? updatedControl : c
            ));

            // Mensagem de sucesso temporária
            setSuccess('Status da marmita atualizado com sucesso!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Erro ao atualizar status da marmita:', error);
            setError('Falha ao atualizar status da marmita');
            
            // Reverter o estado em caso de erro
            const originalControls = await mealControlService.getMealControls();
            setMealControls(originalControls);
        }
    };

    // Obter ícone para o tipo de refeição
    const getMealTypeIcon = (mealType: string) => {
        switch (mealType) {
            case 'breakfast':
                return <Coffee className="h-4 w-4" />;
            case 'lunch':
                return <UtensilsCrossed className="h-4 w-4" />;
            case 'dinner':
                return <Moon className="h-4 w-4" />;
            case 'snack':
                return <Cookie className="h-4 w-4" />;
            default:
                return <UtensilsCrossed className="h-4 w-4" />;
        }
    };

    // Obter nome amigável para o tipo de refeição
    const getMealTypeName = (mealType: string) => {
        switch (mealType) {
            case 'breakfast':
                return 'Café da Manhã';
            case 'lunch':
                return 'Almoço';
            case 'dinner':
                return 'Jantar';
            case 'snack':
                return 'Lanche';
            default:
                return mealType;
        }
    };

    // Formatação de moeda
    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Memoize os registros de hoje para evitar cálculos repetidos
    const todayRecords = useMemo(() => {
        const records: { control: MealControl; record: MealRecord }[] = [];
        
        // Coletar registros de hoje de todos os controles
        filteredControls.forEach(control => {
            control.mealRecords.forEach(record => {
                const recordDate = parseISO(record.date as string);
                if (isToday(recordDate)) {
                    records.push({ control, record });
                }
            });
        });
        
        // Ordenar por tipo de refeição
        const mealTypeOrder = {
            'breakfast': 0,
            'lunch': 1,
            'dinner': 2,
            'snack': 3
        };
        
        return records.sort((a, b) => {
            return mealTypeOrder[a.record.mealType as keyof typeof mealTypeOrder] -
                mealTypeOrder[b.record.mealType as keyof typeof mealTypeOrder];
        });
    }, [filteredControls]);

    // Renderizar o conteúdo da página
    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Controle de Marmitas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Gerenciamento e controle de refeições fornecidas aos funcionários
                    </p>
                </div>
                <Button
                    onClick={() => {
                        fetchAvailableWorkers();
                        setShowAddControlModal(true);
                    }}
                    className="mt-4 md:mt-0"
                    disabled={workers.length === 0}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Controle de Marmita
                </Button>
            </div>

            {/* Mensagens de erro/sucesso */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {error}
                    <button
                        className="absolute top-0 bottom-0 right-0 px-4"
                        onClick={() => setError(null)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    {success}
                    <button
                        className="absolute top-0 bottom-0 right-0 px-4"
                        onClick={() => setSuccess(null)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Funcionários com Marmita</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            Total de funcionários com controle
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Marmitas Hoje</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMealsToday}</div>
                        <p className="text-xs text-muted-foreground">
                            Refeições fornecidas hoje
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Marmitas no Mês</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMealsMonth}</div>
                        <p className="text-xs text-muted-foreground">
                            Total de refeições neste mês
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.totalCostMonth)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valor total gasto com marmitas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            type="text"
                            placeholder="Buscar funcionário..."
                            className="pl-10 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select
                        value={departmentFilter}
                        onValueChange={setDepartmentFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Departamento" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Departamentos</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept.value} value={dept.value}>
                                    {dept.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="employees">Funcionários</TabsTrigger>
                            <TabsTrigger value="meals">Refeições de Hoje</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Conteúdo das abas */}
            <div className="mt-4">
                {activeTab === 'employees' ? (
                    // Aba de Funcionários
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Funcionário</TableHead>
                                    <TableHead>Departamento</TableHead>
                                    <TableHead>Plano de Refeição</TableHead>
                                    <TableHead>Auxílio Refeição</TableHead>
                                    <TableHead>Refeições do Mês</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-8">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                                            </div>
                                            <div className="mt-2">Carregando dados...</div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredControls.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-8">
                                            <div className="flex flex-col items-center justify-center">
                                                <UtensilsCrossed className="h-12 w-12 text-gray-400 mb-2" />
                                                <p>Nenhum controle de marmita encontrado</p>
                                                {(searchTerm || departmentFilter !== 'all') ? (
                                                    <Button
                                                        variant="outline"
                                                        className="mt-2"
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setDepartmentFilter('all');
                                                        }}
                                                    >
                                                        Limpar filtros
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="mt-2"
                                                        onClick={() => {
                                                            fetchAvailableWorkers();
                                                            setShowAddControlModal(true);
                                                        }}
                                                    >
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                        Adicionar controle de marmita
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredControls.map((control) => {
                                        // Calcular o total de refeições do mês atual
                                        const today = new Date();
                                        const currentMonth = today.getMonth();
                                        const currentYear = today.getFullYear();

                                        const monthlyMeals = control.mealRecords.filter(record => {
                                            const recordDate = parseISO(record.date as string);
                                            return recordDate.getMonth() === currentMonth &&
                                                recordDate.getFullYear() === currentYear &&
                                                record.provided;
                                        });

                                        return (
                                            <TableRow key={control._id}>
                                                <TableCell className="font-medium">{control.employeeName}</TableCell>
                                                <TableCell>{control.department}</TableCell>
                                                <TableCell>
                                                    {control.mealPlanType === 'daily' && 'Diário'}
                                                    {control.mealPlanType === 'flexible' && 'Flexível'}
                                                    {control.mealPlanType === 'none' && 'Sem plano'}
                                                </TableCell>
                                                <TableCell>
                                                    {control.hasMealAllowance ? (
                                                        <Badge className="bg-green-100 text-green-800">Sim</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-800">Não</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {monthlyMeals.length} refeições
                                                    {control.monthlyBudget ? (
                                                        <span className="text-xs text-gray-500 block">
                                                            Orçamento: {formatCurrency(control.monthlyBudget)}
                                                        </span>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedControl(control);
                                                                setShowAddRecordModal(true);
                                                            }}
                                                        >
                                                            <Calendar className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => {
                                                                setSelectedControl(control);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    // Aba de Refeições de Hoje
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Funcionário</TableHead>
                                    <TableHead>Departamento</TableHead>
                                    <TableHead>Tipo de Refeição</TableHead>
                                    <TableHead>Custo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-8">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                                            </div>
                                            <div className="mt-2">Carregando dados...</div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Usar o todayRecords memoizado em vez de recalcular
                                    (() => {
                                        // Verificar se existem registros para hoje
                                        if (todayRecords.length === 0) {
                                            return (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center p-8">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <Calendar className="h-12 w-12 text-gray-400 mb-2" />
                                                            <p>Nenhuma refeição registrada para hoje</p>
                                                            <Button
                                                                className="mt-2"
                                                                onClick={() => {
                                                                    if (filteredControls.length > 0) {
                                                                        setSelectedControl(filteredControls[0]);
                                                                        setShowAddRecordModal(true);
                                                                    } else {
                                                                        setError('Nenhum funcionário com controle de marmita encontrado');
                                                                    }
                                                                }}
                                                                disabled={filteredControls.length === 0}
                                                            >
                                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                                Adicionar refeição
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }

                                        // Renderizar linhas da tabela usando o todayRecords memoizado
                                        return todayRecords.map(({ control, record }) => (
                                            <TableRow key={record._id ? record._id.toString() : `temp-${Math.random()}`}>
                                                <TableCell className="font-medium">{control.employeeName}</TableCell>
                                                <TableCell>{control.department}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        {getMealTypeIcon(record.mealType)}
                                                        <span className="ml-2">{getMealTypeName(record.mealType)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatCurrency(record.cost || 0)}</TableCell>
                                                <TableCell>
                                                    {record.provided ? (
                                                        <Badge className="bg-green-100 text-green-800">Fornecida</Badge>
                                                    ) : (
                                                        <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleToggleMealProvided(
                                                                control, 
                                                                record._id ? record._id.toString() : '',
                                                                !record.provided
                                                            )}
                                                            disabled={!record._id}
                                                            title={record.provided ? "Marcar como não fornecida" : "Marcar como fornecida"}
                                                        >
                                                            {record.provided ? (
                                                                <X className="h-4 w-4" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => {
                                                                setSelectedControl(control);
                                                                setSelectedRecordId(record._id ? record._id.toString() : '');
                                                                setShowDeleteModal(true);
                                                            }}
                                                            disabled={!record._id}
                                                            title="Excluir registro"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ));
                                    })()
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Modal para adicionar controle de marmita */}
            <Dialog 
                open={showAddControlModal} 
                onOpenChange={(isOpen) => {
                    setShowAddControlModal(isOpen);
                    // Carregar workers apenas quando o modal abrir
                    if (isOpen) fetchAvailableWorkers();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Controle de Marmita</DialogTitle>
                        <DialogDescription>
                            Adicione um novo funcionário ao controle de marmitas.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label>Funcionário</label>
                            <Select
                                value={mealControlForm.employeeId}
                                onValueChange={(value) => setMealControlForm({
                                    ...mealControlForm,
                                    employeeId: value
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um funcionário" />
                                </SelectTrigger>
                                <SelectContent>
                                    {workers.map((worker) => (
                                        <SelectItem key={worker._id} value={worker._id}>
                                            {worker.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="meal-allowance"
                                checked={mealControlForm.hasMealAllowance}
                                onCheckedChange={(checked) => setMealControlForm({
                                    ...mealControlForm,
                                    hasMealAllowance: checked
                                })}
                            />
                            <label htmlFor="meal-allowance">Possui auxílio refeição</label>
                        </div>
                        <div className="space-y-2">
                            <label>Tipo de Plano</label>
                            <Select
                                value={mealControlForm.mealPlanType}
                                onValueChange={(value) => setMealControlForm({
                                    ...mealControlForm,
                                    mealPlanType: value
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Diário</SelectItem>
                                    <SelectItem value="flexible">Flexível</SelectItem>
                                    <SelectItem value="none">Sem plano</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label>Orçamento Mensal (R$)</label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={mealControlForm.monthlyBudget}
                                onChange={(e) => setMealControlForm({
                                    ...mealControlForm,
                                    monthlyBudget: parseFloat(e.target.value) || 0
                                })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddControlModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateMealControl}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para adicionar registro de marmita */}
            <Dialog open={showAddRecordModal} onOpenChange={setShowAddRecordModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Registro de Refeição</DialogTitle>
                        <DialogDescription>
                            {selectedControl && `Adicionar refeição para ${selectedControl.employeeName}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label>Data</label>
                            <Input
                                type="date"
                                value={mealRecordForm.date}
                                onChange={(e) => setMealRecordForm({
                                    ...mealRecordForm,
                                    date: e.target.value
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Tipo de Refeição</label>
                            <Select
                                value={mealRecordForm.mealType}
                                onValueChange={(value) => setMealRecordForm({
                                    ...mealRecordForm,
                                    mealType: value
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="breakfast">Café da Manhã</SelectItem>
                                    <SelectItem value="lunch">Almoço</SelectItem>
                                    <SelectItem value="dinner">Jantar</SelectItem>
                                    <SelectItem value="snack">Lanche</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="meal-provided"
                                checked={mealRecordForm.provided}
                                onCheckedChange={(checked) => setMealRecordForm({
                                    ...mealRecordForm,
                                    provided: checked
                                })}
                            />
                            <label htmlFor="meal-provided">Refeição fornecida</label>
                        </div>
                        <div className="space-y-2">
                            <label>Custo (R$)</label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={mealRecordForm.cost}
                                onChange={(e) => setMealRecordForm({
                                    ...mealRecordForm,
                                    cost: parseFloat(e.target.value) || 0
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Observações</label>
                            <Input
                                value={mealRecordForm.notes}
                                onChange={(e) => setMealRecordForm({
                                    ...mealRecordForm,
                                    notes: e.target.value
                                })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddRecordModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAddMealRecord}>
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmação para excluir */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            {selectedRecordId
                                ? "Tem certeza que deseja excluir este registro de refeição?"
                                : "Tem certeza que deseja excluir este controle de marmita?"}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteMealControl}>
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
