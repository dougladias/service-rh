// src/services/benefits-service.ts
import axios from 'axios';

// Tipos para manipulação de benefícios
export interface BenefitType {
  _id: string;
  name: string;
  description: string;
  hasDiscount: boolean;
  discountPercentage?: number;
  defaultValue: number;
  status?: 'active' | 'inactive';
}

export interface EmployeeBenefit {
  _id: string;
  employeeId: string;
  benefitTypeId: string;
  value: number;
  status: 'active' | 'inactive';
  startDate: string;
  endDate?: string;
  benefitType?: BenefitType;
}

export class BenefitsService {
  // Buscar todos os tipos de benefícios
  async getBenefitTypes(): Promise<BenefitType[]> {
    try {
      const response = await axios.get('/api/benefit-types');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipos de benefícios:', error);
      throw error;
    }
  }

  // Criar um novo tipo de benefício
  async createBenefitType(benefitType: Partial<BenefitType>): Promise<BenefitType> {
    try {
      const response = await axios.post('/api/benefit-types', benefitType);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tipo de benefício:', error);
      throw error;
    }
  }

  // Buscar benefícios de um funcionário específico
  async getEmployeeBenefits(employeeId: string, status?: 'active' | 'inactive'): Promise<EmployeeBenefit[]> {
    try {
      const params = { employeeId, ...(status && { status }) };
      const response = await axios.get('/api/employee-benefits', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar benefícios do funcionário:', error);
      throw error;
    }
  }

  // Adicionar um benefício para um funcionário
  async addEmployeeBenefit(benefitData: Partial<EmployeeBenefit>): Promise<EmployeeBenefit> {
    try {
      const response = await axios.post('/api/employee-benefits', benefitData);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar benefício do funcionário:', error);
      throw error;
    }
  }

  // Atualizar um benefício específico de um funcionário
  async updateEmployeeBenefit(
    benefitId: string, 
    updateData: Partial<EmployeeBenefit>
  ): Promise<EmployeeBenefit> {
    try {
      const response = await axios.put(`/api/employee-benefits?id=${benefitId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar benefício do funcionário:', error);
      throw error;
    }
  }

  // Remover (desativar) um benefício de um funcionário
  async removeEmployeeBenefit(benefitId: string): Promise<EmployeeBenefit> {
    try {
      const response = await axios.delete(`/api/employee-benefits?id=${benefitId}`);
      return response.data.employeeBenefit;
    } catch (error) {
      console.error('Erro ao remover benefício do funcionário:', error);
      throw error;
    }
  }
}

// Exportar uma instância do serviço
export const benefitsService = new BenefitsService();