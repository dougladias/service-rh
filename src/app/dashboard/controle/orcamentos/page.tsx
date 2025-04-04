"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  PlusCircle,   
  X, 
  Edit, 
  Trash2, 
  Search, 
  AlertTriangle,  
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,  
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,  
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Budget, BudgetItem, budgetService } from '@/services/budget-service';

// Interface para os filtros de busca
interface BudgetFilters {
  year: string;
  type: string;
  status: string;
  search: string;
}

// Interface para o formulário de orçamento
interface BudgetForm {
  title: string;
  type: 'departamental' | 'projeto' | 'operacional';
  year: number;
  department: string;
  items: BudgetItem[];
  status: 'draft' | 'approved' | 'rejected' | 'in_progress';
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export default function OrcamentosPage() {
  // Estado para autenticação
  const { status } = useSession();
  const router = useRouter();
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Estados para gerenciamento de orçamentos
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para formulário e modal
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  // Estado para o formulário
  const initialBudgetForm: BudgetForm = {
    title: '',
    type: 'departamental',
    year: new Date().getFullYear(),
    department: '',
    items: [],
    status: 'draft',
    startDate: '',
    endDate: '',
    notes: ''
  };
  const [budgetForm, setBudgetForm] = useState<BudgetForm>(initialBudgetForm);

  // Estado para filtros
  const [filters, setFilters] = useState<BudgetFilters>({
    year: 'all',
    type: 'all',
    status: 'all',
    search: ''
  });

  // Estado para item temporário
  const [tempItem, setTempItem] = useState<Partial<BudgetItem>>({
    description: '',
    category: '',
    estimatedValue: 0
  });
  
  // Estado para acompanhar o envio do formulário
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);

  // Carregar orçamentos
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setIsLoading(true);
        const response = await budgetService.getBudgets();
        setBudgets(response.budgets || []);
      } catch (error) {
        console.error('Erro ao buscar orçamentos:', error);
        setError('Falha ao carregar os dados de orçamentos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  // Filtrar orçamentos quando os filtros ou budgets mudarem
  useEffect(() => {
    if (!budgets) return;

    let filtered = [...budgets];

    // Filtrar por ano
    if (filters.year !== 'all') {
      filtered = filtered.filter(budget => budget.year === parseInt(filters.year));
    }

    // Filtrar por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(budget => budget.type === filters.type);
    }

    // Filtrar por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(budget => budget.status === filters.status);
    }

    // Filtrar por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(budget => 
        budget.title.toLowerCase().includes(searchLower) ||
        budget.department?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por ano e título
    filtered.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.title.localeCompare(b.title);
    });

    setFilteredBudgets(filtered);
    setCurrentPage(1); // Reset para a primeira página ao filtrar
  }, [filters, budgets]);

  // Calcular total estimado baseado nos itens
  const calculateTotalEstimated = (items: BudgetItem[]) => {
    return items.reduce((sum, item) => sum + item.estimatedValue, 0);
  };

  // Adicionar item à lista
  const handleAddItem = () => {
    if (!tempItem.description || !tempItem.category || !tempItem.estimatedValue) {
      setError('Preencha todos os campos do item');
      return;
    }

    setBudgetForm({
      ...budgetForm,
      items: [
        ...budgetForm.items, 
        {
          description: tempItem.description || '',
          category: tempItem.category || '',
          estimatedValue: Number(tempItem.estimatedValue) || 0
        }
      ]
    });

    // Limpar o item temporário
    setTempItem({
      description: '',
      category: '',
      estimatedValue: 0
    });
    
    setError(null);
  };

  // Remover item da lista
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...budgetForm.items];
    updatedItems.splice(index, 1);
    setBudgetForm({
      ...budgetForm,
      items: updatedItems
    });
  };

  // Salvar orçamento (criar ou atualizar)
  const handleSaveBudget = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validações
      if (!budgetForm.title.trim()) {
        setError('O título do orçamento é obrigatório');
        setIsSubmitting(false);
        return;
      }

      if (budgetForm.items.length === 0) {
        setError('Adicione pelo menos um item ao orçamento');
        setIsSubmitting(false);
        return;
      }

      if (!budgetForm.year || budgetForm.year < 2000 || budgetForm.year > 2100) {
        setError('Informe um ano válido (entre 2000 e 2100)');
        setIsSubmitting(false);
        return;
      }

      // Preparar dados para envio
      const items = budgetForm.items.map(item => ({
        ...item,
        estimatedValue: parseFloat(item.estimatedValue.toString()) || 0
      }));
      
      // Calcular o valor total estimado
      const totalEstimatedValue = items.reduce(
        (sum, item) => sum + item.estimatedValue, 
        0
      );
      
      const formData = {
        ...budgetForm,
        // Garantir que startDate e endDate sejam undefined se estiverem vazios
        startDate: budgetForm.startDate ? budgetForm.startDate : undefined,
        endDate: budgetForm.endDate ? budgetForm.endDate : undefined,
        // Garantir que o tipo seja um dos valores válidos
        type: budgetForm.type as 'departamental' | 'projeto' | 'operacional',
        // Garantir que o status seja um dos valores válidos
        status: (budgetForm.status || 'draft') as 'draft' | 'approved' | 'rejected' | 'in_progress',
        // Adicionar o valor total calculado
        totalEstimatedValue,
        // Adicionar os itens com valores numéricos válidos
        items
      };

      // Criar ou atualizar
      if (editingBudget && editingBudget._id) {
        await budgetService.updateBudget(editingBudget._id, formData);
        setSuccess('Orçamento atualizado com sucesso!');
      } else {
        await budgetService.createBudget(formData);
        setSuccess('Orçamento criado com sucesso!');
      }

      // Fechar modal e resetar form
      setOpenFormDialog(false);
      setBudgetForm(initialBudgetForm);
      setEditingBudget(null);

      // Recarregar a lista
      const response = await budgetService.getBudgets();
      setBudgets(response.budgets || []);

      // Limpar mensagem após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      if (error instanceof Error) {
        setError(`Erro ao salvar orçamento: ${error.message}`);
      } else {
        setError('Erro ao salvar orçamento');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Editar orçamento existente
  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      title: budget.title,
      type: budget.type,
      year: budget.year,
      department: budget.department || '',
      items: budget.items || [],
      status: budget.status,
      startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
      endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
      notes: budget.notes || ''
    });
    setOpenFormDialog(true);
  };

  // Abrir modal de exclusão
  const handleOpenDeleteDialog = (budgetId: string) => {
    setBudgetToDelete(budgetId);
    setOpenDeleteDialog(true);
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;

    try {
      await budgetService.deleteBudget(budgetToDelete);
      
      // Atualizar lista local
      setBudgets(budgets.filter(budget => budget._id !== budgetToDelete));
      setSuccess('Orçamento excluído com sucesso!');
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      setError('Erro ao excluir orçamento');
    } finally {
      setOpenDeleteDialog(false);
      setBudgetToDelete(null);
    }
  };

  // Formatar status para exibição
  const formatStatus = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      case 'in_progress': return 'Em Andamento';
      default: return status;
    }
  };

  // Obter classe CSS para o status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatar tipo para exibição
  const formatType = (type: string) => {
    switch (type) {
      case 'departamental': return 'Departamental';
      case 'projeto': return 'Projeto';
      case 'operacional': return 'Operacional';
      default: return type;
    }
  };

  // Calcular totais para o resumo
  const totalBudgets = filteredBudgets.length;
  const totalApproved = filteredBudgets.filter(b => b.status === 'approved').length;
  const totalEstimated = filteredBudgets.reduce((sum, b) => sum + (b.totalEstimatedValue || 0), 0);
  const totalActual = filteredBudgets.reduce((sum, b) => sum + (b.totalActualValue || 0), 0);

  // Paginação
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBudgets.slice(startIndex, startIndex + itemsPerPage);
  };

  // Obter anos únicos dos orçamentos para filtro
  const uniqueYears = [...new Set(budgets.map(b => b.year))].sort((a, b) => b - a);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Gestão de Orçamentos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Controle e acompanhamento de orçamentos da empresa
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingBudget(null);
            setBudgetForm(initialBudgetForm);
            setOpenFormDialog(true);
          }}
          className="mt-4 md:mt-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Mensagens de sucesso/erro */}
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

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudgets}</div>
            <p className="text-xs text-muted-foreground">
              {totalApproved} aprovados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEstimated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total orçado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalActual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total realizado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEstimated > 0 
                ? (((totalActual - totalEstimated) / totalEstimated) * 100).toFixed(2) + '%'
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Realizado vs. estimado
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
              placeholder="Buscar orçamento..."
              className="pl-10 w-full md:w-64"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={filters.year}
              onValueChange={(value) => setFilters({...filters, year: value})}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({...filters, type: value})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de Orçamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="departamental">Departamental</SelectItem>
                <SelectItem value="projeto">Projeto</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({...filters, status: value})}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela de Orçamentos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/5">Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead className="text-right">Valor Estimado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                  <div className="mt-2">Carregando orçamentos...</div>
                </TableCell>
              </TableRow>
            ) : getCurrentItems().length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center p-8">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-2" />
                    <p>Nenhum orçamento encontrado</p>
                    {filters.search || filters.year !== 'all' || filters.type !== 'all' || filters.status !== 'all' ? (
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setFilters({year: 'all', type: 'all', status: 'all', search: ''})}
                      >
                        Limpar filtros
                      </Button>
                    ) : (
                      <Button 
                        className="mt-2"
                        onClick={() => setOpenFormDialog(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar novo orçamento
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              getCurrentItems().map((budget) => (
                <TableRow key={budget._id}>
                  <TableCell className="font-medium">{budget.title}</TableCell>
                  <TableCell>{formatType(budget.type)}</TableCell>
                  <TableCell>{budget.year}</TableCell>
                  <TableCell>{budget.department || '-'}</TableCell>
                  <TableCell className="text-right">
                    {budget.totalEstimatedValue
                      ? budget.totalEstimatedValue.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusClass(budget.status)}>
                      {formatStatus(budget.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditBudget(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleOpenDeleteDialog(budget._id as string)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredBudgets.length)} de {filteredBudgets.length} orçamentos
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Formulário */}
      <Dialog open={openFormDialog} onOpenChange={setOpenFormDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
            <DialogDescription>
              {editingBudget
                ? 'Edite os detalhes do orçamento existente'
                : 'Adicione um novo orçamento ao sistema'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Título*
              </label>
              <Input
                id="title"
                value={budgetForm.title}
                onChange={(e) => setBudgetForm({...budgetForm, title: e.target.value})}
                placeholder="Título do orçamento"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium">
                Tipo*
              </label>
              <Select
                value={budgetForm.type}
                onValueChange={(value: 'departamental' | 'projeto' | 'operacional') => 
                  setBudgetForm({...budgetForm, type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departamental">Departamental</SelectItem>
                  <SelectItem value="projeto">Projeto</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="year" className="block text-sm font-medium">
                Ano*
              </label>
              <Input
                id="year"
                type="number"
                value={budgetForm.year}
                onChange={(e) => setBudgetForm({...budgetForm, year: Number(e.target.value)})}
                placeholder="Ano do orçamento"
                min="2023"
                max="2030"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium">
                Departamento
              </label>
              <Input
                id="department"
                value={budgetForm.department}
                onChange={(e) => setBudgetForm({...budgetForm, department: e.target.value})}
                placeholder="Departamento (opcional)"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium">
                Data Inicial
              </label>
              <Input
                id="startDate"
                type="date"
                value={budgetForm.startDate}
                onChange={(e) => setBudgetForm({...budgetForm, startDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-medium">
                Data Final
              </label>
              <Input
                id="endDate"
                type="date"
                value={budgetForm.endDate}
                onChange={(e) => setBudgetForm({...budgetForm, endDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium">
                Observações
              </label>
              <Input
                id="notes"
                value={budgetForm.notes}
                onChange={(e) => setBudgetForm({...budgetForm, notes: e.target.value})}
                placeholder="Observações adicionais"
              />
            </div>
            
            {/* Status somente para edição */}
            {editingBudget && (
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium">
                  Status
                </label>
                <Select
                  value={budgetForm.status}
                  onValueChange={(value: 'draft' | 'approved' | 'rejected' | 'in_progress') => 
                    setBudgetForm({...budgetForm, status: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {/* Seção de itens */}
          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-medium">Itens do Orçamento</h3>
            
            {/* Adicionar novo item */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Descrição do item"
                value={tempItem.description}
                onChange={(e) => setTempItem({...tempItem, description: e.target.value})}
              />
              <Input
                placeholder="Categoria"
                value={tempItem.category}
                onChange={(e) => setTempItem({...tempItem, category: e.target.value})}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Valor estimado"
                  value={tempItem.estimatedValue || ''}
                  onChange={(e) => setTempItem({
                    ...tempItem, 
                    estimatedValue: e.target.value ? Number(e.target.value) : 0
                  })}
                />
                <Button type="button" onClick={handleAddItem}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Lista de itens */}
            {budgetForm.items.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor Estimado</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetForm.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.estimatedValue.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="font-bold">
                        Total Estimado
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {calculateTotalEstimated(budgetForm.items).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
                <FileText className="h-12 w-12 text-gray-400 mb-2" />
                <p>Nenhum item adicionado</p>
                <p className="text-sm text-gray-500">Adicione itens ao orçamento usando o formulário acima</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setOpenFormDialog(false);
                setBudgetForm(initialBudgetForm);
                setEditingBudget(null);
                setError(null);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveBudget} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setOpenDeleteDialog(false);
                setBudgetToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}