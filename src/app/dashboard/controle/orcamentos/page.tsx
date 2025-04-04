'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Definição de tipos
interface BudgetItem {
  description: string;
  category: string;
  estimatedValue: number;
}

interface Budget {
  _id?: string;
  title: string;
  type: 'departmental' | 'project' | 'capital' | 'operational';
  year: number;
  department?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  items?: BudgetItem[];
  totalEstimatedValue: number;
}

// Mock do serviço de orçamentos (substitua pelo seu serviço real)
const budgetService = {
  getBudgets: async (): Promise<Budget[]> => {
    return [];
  },
  createBudget: async (budget: Budget): Promise<Budget> => {
    return { ...budget, _id: `budget-${Date.now()}` };
  },
  updateBudget: async (budget: Budget): Promise<Budget> => {
    return budget;
  },
  deleteBudget: async (id: string): Promise<void> => {
    console.log(`Deletando orçamento com ID: ${id}`);
    // Implementação de delete
  }
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget>({
    title: '',
    type: 'departmental',
    year: new Date().getFullYear(),
    status: 'draft',
    items: [],
    totalEstimatedValue: 0
  });

  // Dados para selects
  const budgetTypes = [
    { value: 'departmental', label: 'Departamental' },
    { value: 'project', label: 'Projeto' },
    { value: 'capital', label: 'Capital' },
    { value: 'operational', label: 'Operacional' }
  ];

  const budgetStatuses = [
    { value: 'draft', label: 'Rascunho', icon: AlertCircle, color: 'text-gray-500' },
    { value: 'pending', label: 'Em aprovação', icon: AlertCircle, color: 'text-yellow-500' },
    { value: 'approved', label: 'Aprovado', icon: CheckCircle, color: 'text-green-500' },
    { value: 'rejected', label: 'Rejeitado', icon: XCircle, color: 'text-red-500' }
  ];

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear + i);
  }, []);

  // Carregar orçamentos
  useEffect(() => {
    async function fetchBudgets() {
      try {
        setLoading(true);
        const data = await budgetService.getBudgets();
        setBudgets(data);
      } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBudgets();
  }, []);

  // Funções para manipular os orçamentos
  const handleCreateBudget = () => {
    setCurrentBudget({
      title: '',
      type: 'departmental',
      year: new Date().getFullYear(),
      status: 'draft',
      items: [],
      totalEstimatedValue: 0
    });
    setIsDialogOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setCurrentBudget(budget);
    setIsDialogOpen(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await budgetService.deleteBudget(id);
        setBudgets(budgets.filter(budget => budget._id !== id));
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
      }
    }
  };

  const addBudgetItem = () => {
    setCurrentBudget(prev => ({
      ...prev,
      items: [...(prev.items || []), {
        description: '',
        category: '',
        estimatedValue: 0
      }]
    }));
  };

  const updateBudgetItem = (index: number, update: Partial<BudgetItem>) => {
    setCurrentBudget(prev => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], ...update };
      
      // Recalcular o valor total estimado
      const totalEstimatedValue = newItems.reduce(
        (sum, item) => sum + (item.estimatedValue || 0), 
        0
      );
      
      return { ...prev, items: newItems, totalEstimatedValue };
    });
  };

  const removeBudgetItem = (index: number) => {
    setCurrentBudget(prev => {
      const newItems = [...(prev.items || [])];
      newItems.splice(index, 1);
      
      // Recalcular o valor total estimado
      const totalEstimatedValue = newItems.reduce(
        (sum, item) => sum + (item.estimatedValue || 0), 
        0
      );
      
      return { ...prev, items: newItems, totalEstimatedValue };
    });
  };

  const handleSaveBudget = async () => {
    try {
      if (!currentBudget.title) {
        alert('O título do orçamento é obrigatório');
        return;
      }

      // Calcular o valor total estimado novamente para garantir precisão
      const totalEstimatedValue = (currentBudget.items || []).reduce(
        (sum, item) => sum + (item.estimatedValue || 0), 
        0
      );

      const budgetToSave = {
        ...currentBudget,
        totalEstimatedValue
      };

      if (currentBudget._id) {
        // Atualizar orçamento existente
        const updatedBudget = await budgetService.updateBudget(budgetToSave);
        setBudgets(prev => prev.map(b => b._id === updatedBudget._id ? updatedBudget : b));
      } else {
        // Criar novo orçamento
        const newBudget = await budgetService.createBudget(budgetToSave);
        setBudgets(prev => [...prev, newBudget]);
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Controle de Orçamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie orçamentos departamentais, de projetos e operacionais
          </p>
        </div>
        <Button
          onClick={handleCreateBudget}
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Tabela de Orçamentos */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Orçamento / Departamento
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Valor Total
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : budgets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Nenhum orçamento encontrado
                </td>
              </tr>
            ) : (
              budgets.map((budget) => {
                const StatusIcon = budgetStatuses.find(
                  status => status.value === budget.status
                )?.icon || AlertCircle;
                const statusColor = budgetStatuses.find(
                  status => status.value === budget.status
                )?.color || 'text-gray-500';

                return (
                  <tr key={budget._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {budget.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {budget.department || 'Sem departamento'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {budgetTypes.find(type => type.value === budget.type)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} bg-opacity-10`}>
                        <StatusIcon className="mr-1.5 h-3 w-3" />
                        {budgetStatuses.find(status => status.value === budget.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(budget.totalEstimatedValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditBudget(budget)}
                          title="Editar Orçamento"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteBudget(budget._id!)}
                          className="text-red-500 hover:bg-red-50"
                          title="Excluir Orçamento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Adicionar/Editar Orçamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {currentBudget._id ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título do Orçamento *
              </label>
              <input
                type="text"
                value={currentBudget.title || ''}
                onChange={(e) => setCurrentBudget(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Nome do orçamento"
                required
              />
            </div>

            {/* Tipo de Orçamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Orçamento *
              </label>
              <select
                value={currentBudget.type || 'departmental'}
                onChange={(e) => setCurrentBudget(prev => ({ ...prev, type: e.target.value as Budget['type'] }))}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
                required
              >
                {budgetTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ano */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ano *
              </label>
              <select
                value={currentBudget.year || new Date().getFullYear()}
                onChange={(e) => setCurrentBudget(prev => ({ ...prev, year: Number(e.target.value) }))}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
                required
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Departamento e Status (opcional) */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Departamento
              </label>
              <input
                type="text"
                value={currentBudget.department || ''}
                onChange={(e) => setCurrentBudget(prev => ({ ...prev, department: e.target.value }))}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Nome do departamento"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={currentBudget.status || 'draft'}
                onChange={(e) => setCurrentBudget(prev => ({ ...prev, status: e.target.value as Budget['status'] }))}
                className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
              >
                {budgetStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Itens do Orçamento */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Itens do Orçamento
              </h3>
              <Button 
                variant="outline" 
                onClick={addBudgetItem}
                className="flex items-center"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>

            {/* Lista de Itens */}
            {currentBudget.items?.map((item, index) => (
              <div 
                key={index} 
                className="grid grid-cols-4 gap-4 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateBudgetItem(index, { description: e.target.value })}
                    className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:border-gray-700"
                    placeholder="Descrição do item"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Categoria *
                  </label>
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => updateBudgetItem(index, { category: e.target.value })}
                    className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:border-gray-700"
                    placeholder="Categoria do item"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Valor Estimado *
                  </label>
                  <input
                    type="number"
                    value={item.estimatedValue}
                    onChange={(e) => updateBudgetItem(index, { estimatedValue: Number(e.target.value) })}
                    className="w-full border rounded p-1 text-sm dark:bg-gray-900 dark:border-gray-700"
                    placeholder="Valor estimado"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeBudgetItem(index)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveBudget}
            >
              {currentBudget._id ? 'Atualizar' : 'Criar'} Orçamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
