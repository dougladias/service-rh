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
      // Calcular valor total estimado
      const totalEstimatedValue = budgetData.items.reduce(
        (sum, item) => sum + (item.estimatedValue || 0), 
        0
      );

      // Criar objeto para enviar à API com campos obrigatórios
      // Preparamos o objeto com um campo createdBy opcional
      const budgetToSend: Omit<Budget, '_id'> = {
        ...budgetData,
        status: 'draft',
        totalEstimatedValue,
        createdBy: undefined
      };

      // Para testar, vamos tentar obter a sessão atual
      try {
        const sessionResponse = await axios.get('/api/auth/session');
        console.log('Dados da sessão:', sessionResponse.data);
        // Se tiver um usuário na sessão, use o ID dele
        if (sessionResponse.data?.user?.id) {
          budgetToSend.createdBy = sessionResponse.data.user.id;
        }
      } catch (sessionError) {
        console.log('Erro ao obter sessão, continuando sem ID de usuário:', sessionError);
      }

      // Enviar a requisição para a API
      const response = await axios.post('/api/budgets', budgetToSend);
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
      let totalEstimatedValue = budgetData.totalEstimatedValue;
      
      if (budgetData.items && budgetData.items.length > 0) {
        totalEstimatedValue = budgetData.items.reduce(
          (sum, item) => sum + (item.estimatedValue || 0), 
          0
        );
      }

      // Remover o createdBy da atualização, se existir
      const { ...dataToUpdate } = budgetData;

      const response = await axios.put(`/api/budgets/${id}`, {
        ...dataToUpdate,
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

  // Tratamento de erros genérico
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      console.log('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response) {
        // O servidor respondeu com um status de erro
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            'Erro ao processar solicitação';
        return new Error(errorMessage);
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