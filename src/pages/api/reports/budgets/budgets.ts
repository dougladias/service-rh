// src/services/budget-service.ts
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
  type: 'departmental' | 'project' | 'operational';
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

export interface BudgetReportSummary {
  type: string;
  status: string;
  year: number;
  totalEstimatedValue: number;
  totalActualValue: number;
  count: number;
  variance: number;
}

export interface BudgetCategorySummary {
  category: string;
  totalEstimatedValue: number;
  totalActualValue: number;
  count: number;
  variance: number;
}

export interface BudgetReportResponse {
  budgetSummary: BudgetReportSummary[];
  categorySummary: BudgetCategorySummary[];
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
  }) {
    try {
      const response = await axios.get('/api/budgets', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      throw error;
    }
  }

  // Buscar um orçamento específico por ID
  async getBudgetById(id: string) {
    try {
      const response = await axios.get(`/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      throw error;
    }
  }

  // Criar novo orçamento
  async createBudget(budgetData: Omit<Budget, '_id' | 'status' | 'createdBy'>) {
    try {
      const response = await axios.post('/api/budgets', budgetData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  }

  // Atualizar orçamento existente
  async updateBudget(id: string, budgetData: Partial<Budget>) {
    try {
      const response = await axios.put(`/api/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  }

  // Excluir orçamento
  async deleteBudget(id: string) {
    try {
      const response = await axios.delete(`/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      throw error;
    }
  }

  // Buscar relatórios de orçamento
  async getBudgetReports(params?: {
    year?: number;
    type?: string;
  }): Promise<BudgetReportResponse> {
    try {
      const response = await axios.get('/api/reports/budgets', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar relatórios de orçamento:', error);
      throw error;
    }
  }
}

// Exportar uma instância do serviço
export const budgetService = new BudgetService();