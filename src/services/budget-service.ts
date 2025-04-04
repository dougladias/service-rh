import axios from 'axios';

// Tipos para o serviço de orçamentos
export interface BudgetItem {
  description: string;
  category: string;
  estimatedValue: number;
  actualValue?: number;
}

export interface Budget {
  _id?: string;
  title: string;
  type: 'departamental' | 'projeto' | 'operacional';
  year: number;
  department?: string;
  totalEstimatedValue: number;
  totalActualValue?: number;
  status: 'draft' | 'approved' | 'rejected' | 'in_progress';
  items: BudgetItem[];
  createdBy?: string;
  approvedBy?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface BudgetPagination {
  budgets: Budget[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export class BudgetService {
  // Buscar orçamentos com filtros opcionais
  async getBudgets(params?: {
    year?: number;
    type?: string;
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<BudgetPagination> {
    try {
      const response = await axios.get('/api/budgets', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      throw this.handleError(error);
    }
  }

  // Buscar um orçamento específico por ID
  async getBudgetById(id: string): Promise<Budget> {
    try {
      const response = await axios.get(`/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      throw this.handleError(error);
    }
  }

  // Criar novo orçamento
  async createBudget(budgetData: Omit<Budget, '_id' | 'status' | 'createdBy'>): Promise<Budget> {
    try {
        // Log para depuração
        console.log('Enviando dados para criar orçamento:', budgetData);

        // Calcular valor total estimado
        const totalEstimatedValue = budgetData.items.reduce(
            (sum, item) => sum + item.estimatedValue, 
            0
        );

        const response = await axios.post('/api/budgets', {
            ...budgetData,
            totalEstimatedValue
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar orçamento:', error);
        throw this.handleError(error);
    }
  }

  // Atualizar orçamento existente
  async updateBudget(id: string, budgetData: Partial<Budget>): Promise<Budget> {
    try {
      // Validações básicas
      if (!id) {
        throw new Error('ID do orçamento é obrigatório');
      }

      // Calcular valor total estimado
      const totalEstimatedValue = budgetData.items?.reduce(
        (sum, item) => sum + (item.estimatedValue || 0), 
        0
      ) || 0;

      const response = await axios.put(`/api/budgets/${id}`, {
        ...budgetData,
        totalEstimatedValue
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw this.handleError(error);
    }
  }

  // Excluir orçamento
  async deleteBudget(id: string): Promise<void> {
    try {
      await axios.delete(`/api/budgets/${id}`);
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      throw this.handleError(error);
    }
  }

  // Validação de dados do orçamento
  private validateBudgetData(budgetData: Omit<Budget, '_id' | 'status' | 'createdBy'>) {
    // Validações básicas
    if (!budgetData.title || budgetData.title.trim().length < 3) {
      throw new Error('Título do orçamento deve ter pelo menos 3 caracteres');
    }

    if (!budgetData.type) {
      throw new Error('Tipo de orçamento é obrigatório');
    }

    if (!budgetData.year || budgetData.year < 2000 || budgetData.year > 2100) {
      throw new Error('Ano inválido');
    }

    if (!budgetData.items || budgetData.items.length === 0) {
      throw new Error('Adicione pelo menos um item no orçamento');
    }

    // Validar itens
    budgetData.items.forEach(item => {
      if (!item.description || !item.category) {
        throw new Error('Todos os itens devem ter descrição e categoria');
      }

      if (item.estimatedValue <= 0) {
        throw new Error('Valor estimado do item deve ser positivo');
      }
    });
  }

  // Tratamento de erros genérico
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // O servidor respondeu com um status de erro
        return new Error(
          error.response.data.message || 
          'Erro ao processar solicitação'
        );
      } else if (error.request) {
        // A requisição foi feita, mas não houve resposta
        return new Error('Sem resposta do servidor');
      } else {
        // Algo aconteceu ao configurar a requisição
        return new Error(error.message || 'Erro desconhecido');
      }
    }
    // Para outros tipos de erro
    return error instanceof Error ? error : new Error(String(error));
  }
}

// Exportar uma instância do serviço
export const budgetService = new BudgetService();