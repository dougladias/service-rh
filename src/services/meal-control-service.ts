// src/services/meal-control-service.ts
import axios from 'axios';

// Interfaces para tipagem
export interface MealRecord {
  _id?: string;
  date: Date | string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  provided: boolean;
  cost?: number;
  notes?: string;
}

export interface MealControl {
  _id?: string;
  employeeId: string;
  employeeName: string;
  department: string;
  hasMealAllowance: boolean;
  mealPlanType: 'daily' | 'flexible' | 'none';
  monthlyBudget?: number;
  mealRecords: MealRecord[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface MealReportPeriod {
  month: number;
  year: number;
  startDate: Date | string;
  endDate: Date | string;
}

export interface MealReportFilter {
  department: string;
}

export interface MealReportData {
  totalEmployees: number;
  totalMealsProvided: number;
  totalCost: number;
  mealsByType: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  mealsByDepartment: {
    [department: string]: {
      count: number;
      cost: number;
    };
  };
}

export interface MealReport {
  period: MealReportPeriod;
  filter: MealReportFilter;
  data: MealReportData;
}

export class MealControlService {
  // Buscar todos os controles de marmita com filtros opcionais
  async getMealControls(params?: {
    employeeId?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<MealControl[]> {
    try {
      const response = await axios.get('/api/meal-control', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar controles de marmita:', error);
      throw error;
    }
  }

  // Buscar um controle de marmita específico
  async getMealControlById(id: string): Promise<MealControl> {
    try {
      const response = await axios.get(`/api/meal-control/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar controle de marmita:', error);
      throw error;
    }
  }

  // Criar um novo controle de marmita
  async createMealControl(data: Partial<MealControl>): Promise<MealControl> {
    try {
      const response = await axios.post('/api/meal-control', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar controle de marmita:', error);
      throw error;
    }
  }

  // Atualizar um controle de marmita
  async updateMealControl(id: string, data: Partial<MealControl>): Promise<MealControl> {
    try {
      const response = await axios.put(`/api/meal-control/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar controle de marmita:', error);
      throw error;
    }
  }

  // Excluir um controle de marmita
  async deleteMealControl(id: string): Promise<void> {
    try {
      await axios.delete(`/api/meal-control/${id}`);
    } catch (error) {
      console.error('Erro ao excluir controle de marmita:', error);
      throw error;
    }
  }

  // Adicionar um registro de marmita
  async addMealRecord(controlId: string, record: Partial<MealRecord>): Promise<MealControl> {
    try {
      const response = await axios.post(`/api/meal-control/record/${controlId}`, record);
      return response.data.mealControl;
    } catch (error) {
      console.error('Erro ao adicionar registro de marmita:', error);
      throw error;
    }
  }

  // Atualizar um registro de marmita
  async updateMealRecord(controlId: string, recordId: string, data: Partial<MealRecord>): Promise<MealControl> {
    try {
      const response = await axios.put(`/api/meal-control/record/${controlId}`, {
        recordId,
        ...data
      });
      return response.data.mealControl;
    } catch (error) {
      console.error('Erro ao atualizar registro de marmita:', error);
      throw error;
    }
  }

  // Excluir um registro de marmita
  async deleteMealRecord(controlId: string, recordId: string): Promise<MealControl> {
    try {
      const response = await axios.delete(`/api/meal-control/record/${controlId}`, {
        data: { recordId }
      });
      return response.data.mealControl;
    } catch (error) {
      console.error('Erro ao excluir registro de marmita:', error);
      throw error;
    }
  }

  // Gerar relatório de marmitas
  async getMealReport(params: {
    month?: number;
    year?: number;
    department?: string;
  }): Promise<MealReport> {
    try {
      const response = await axios.get('/api/meal-control/report', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de marmitas:', error);
      throw error;
    }
  }
}