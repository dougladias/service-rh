// src/types/reports.ts

import { Document } from 'mongoose';

// Interfaces para o módulo de Relatórios
export interface PayrollReport extends Document {
  employeeId: string;
  employeeName: string;
  contract: 'CLT' | 'PJ';
  month: number;
  year: number;
  baseSalary: number;
  overtimePay?: number;
  overtimeHours?: number;
  deductions: number;
  totalSalary: number;
  inss?: number;
  fgts?: number;
  irrf?: number;
  department?: string;
  status: 'pending' | 'processed' | 'paid';
  processedAt?: Date;
}

export interface SummaryItem {
  id: number;
  description: string;
  value: number;
}

export interface DepartmentSummary {
  id: number;
  department: string;
  employees: number;
  totalBase: number;
  totalExtra: number;
  totalNet: number;
}

export interface PayrollSummary {
  totalBaseSalary: number;
  totalOvertimePay: number;
  totalINSS: number;
  totalFGTS: number;
  totalIRRF: number;
  totalBenefits: number;
  totalDeductions: number;
  totalNetSalary: number;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface TaxesData {
  description: string;
  baseCalc: number;
  rate: string;
  value: number;
}

export interface MonthOption {
  value: string;
  label: string;
}

export interface DepartmentOption {
  value: string;
  label: string;
}

// Resposta da API de relatórios financeiros
export interface FinancialReportResponse {
  payrolls: PayrollReport[];
  summary: PayrollSummary;
  summaryData: SummaryItem[];
  departmentData: DepartmentSummary[];
  transportVoucher: number;
  mealVoucher: number;
  otherBenefits: number;
}

// Interface para funções de exportação
export interface ExportOptions {
  fileName?: string;
  title?: string;
  subtitle?: string;
  sheets?: {
    [key: string]: object[];
  };
}