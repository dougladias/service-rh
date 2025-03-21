

import { Payroll, PayrollFilter } from '@/types/payroll'

// Dados mocados de folha de pagamento
export const getPayrolls = (filter?: PayrollFilter): Payroll[] => {
  const payrolls: Payroll[] = [
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Maria Silva',
      month: 3,
      year: 2024,
      baseSalary: 7500,
      overtimeHours: 10,
      overtimePay: 1125, // Cálculo de horas extras
      deductions: 1200, // Impostos e outros descontos
      totalSalary: 7425, // Salário base + horas extras - descontos
      inss: 780,
      irrf: 420,
      status: 'processed'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'João Costa',
      month: 3,
      year: 2024,
      baseSalary: 6200,
      overtimeHours: 5,
      overtimePay: 620,
      deductions: 950,
      totalSalary: 5870,
      inss: 650,
      irrf: 300,
      status: 'processed'
    },
    {
      id: '3',
      employeeId: '3',
      employeeName: 'Ana Oliveira',
      month: 3,
      year: 2024,
      baseSalary: 5500,
      overtimeHours: 0,
      overtimePay: 0,
      deductions: 800,
      totalSalary: 4700,
      inss: 570,
      irrf: 230,
      status: 'pending'
    }
  ]

  // Filtrar resultados se filtro for fornecido
  return payrolls.filter(payroll => {
    if (filter?.month && payroll.month !== filter.month) return false
    if (filter?.year && payroll.year !== filter.year) return false
    if (filter?.status && payroll.status !== filter.status) return false
    return true
  })
}

// Função para processar folha de pagamento
export const processPayroll = async (month: number, year: number): Promise<Payroll[]> => {
  // Lógica de processamento de folha de pagamento
  // No futuro, será substituída por lógica real de cálculo
  return getPayrolls({ month, year }).map(payroll => ({
    ...payroll,
    status: 'processed'
  }))
}

// Função para gerar holerite
export const generatePayslip = async (payrollId: string): Promise<Blob> => {
  // Futuramente, implementar geração real de PDF
  const payroll = getPayrolls().find(p => p.id === payrollId)
  
  if (!payroll) {
    throw new Error('Folha de pagamento não encontrada')
  }

  // Mock de geração de PDF
  const pdfContent = `Holerite - ${payroll.employeeName} - ${payroll.month}/${payroll.year}`
  return new Blob([pdfContent], { type: 'application/pdf' })
}