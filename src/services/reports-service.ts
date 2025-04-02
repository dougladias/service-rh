// src/services/reports-service.ts

// Interfaces para tipagem
export interface ISummaryItem {
  id: number;
  description: string;
  value: number;
}

export interface IDepartmentItem {
  id: number;
  department: string;
  employees: number;
  totalBase: number;
  totalExtra: number;
  totalNet: number;
}

export interface ISummary {
  totalBaseSalary: number;
  totalOvertimePay: number;
  totalINSS: number;
  totalFGTS: number;
  totalIRRF: number;
  totalBenefits: number;
  totalDeductions: number;
  totalNetSalary: number;
}

export interface IChartDataItem {
  name: string;
  value: number;
}

export interface IPayroll {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  baseSalary: number;
  overtimePay: number;
  inss: number;
  fgts: number;
  irrf: number;
  benefits: number;
  deductions: number;
  netSalary: number;
}

export interface IFinancialReportResponse {
  payrolls: IPayroll[];
  summary: ISummary;
  summaryData: ISummaryItem[];
  departmentData: IDepartmentItem[];
  transportVoucher: number;
  mealVoucher: number;
  otherBenefits: number;
}

// Formatar valores monetários
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Buscar dados de relatórios financeiros
export async function getFinancialReports(
  month: string, 
  year: string, 
  department: string = 'all'
): Promise<IFinancialReportResponse> {
  try {
    // Construir a URL da API com os parâmetros
    const url = `/api/reports/financial?month=${month}&year=${year}${department !== 'all' ? `&department=${department}` : ''}`;
    
    // Fazer a chamada à API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar relatórios: ${response.status}`);
    }
    
    // Processar a resposta
    const data: IFinancialReportResponse = await response.json();
    console.log('Dados recebidos da API:', data);
    return data;
    
  } catch (error) {
    console.error('Erro ao buscar relatórios financeiros:', error);
    throw error;
  }
}

// Calcular dados de gráfico para encargos do empregador
export function getEmployerChargesData(totalSalary: number): IChartDataItem[] {
  // Valor base para cálculo de encargos
  const baseValue = totalSalary;
  
  return [
    { name: 'INSS (20%)', value: baseValue * 0.20 },
    { name: 'FGTS (8%)', value: baseValue * 0.08 },
    { name: 'PIS/PASEP (1%)', value: baseValue * 0.01 },
    { name: 'Seguro Acidente', value: baseValue * 0.015 },
    { name: 'Outros', value: baseValue * 0.006 }
  ];
}

// Calcular dados de gráfico para descontos do funcionário
export function getEmployeeDeductionsData(
  inss: number, 
  irrf: number, 
  transportVoucher: number, 
  otherDeductions: number = 0
): IChartDataItem[] {
  return [
    { name: 'INSS', value: inss },
    { name: 'IRRF', value: irrf },
    { name: 'Vale Transporte', value: transportVoucher },
    { name: 'Outros Descontos', value: otherDeductions }
  ];
}