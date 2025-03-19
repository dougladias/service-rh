
// Definir os tipos para o módulo de folha de pagamento
export interface Payroll {
    id: string;
    employeeId: string;
    employeeName: string;
    month: number;
    year: number;
    baseSalary: number;
    overtimeHours: number;
    overtimePay: number;
    deductions: number;
    totalSalary: number;
    inss: number;
    irrf: number;
    status: 'processed' | 'pending' | 'paid';
  }
  
  // Definir os tipos para o filtro de folha de pagamento
  export interface PayrollFilter {
    month?: number;
    year?: number;
    status?: 'processed' | 'pending' | 'paid';
  }