// src/services/payroll-service.ts

import { IWorker } from '@/models/Worker';
import axios from 'axios';

interface PayrollCalculation {
  baseSalary: number;
  overtimePay: number;
  deductions: number;
  totalSalary: number;
  inss?: number;
  fgts?: number;
  irrf?: number;
}

export class PayrollService {
  // Calcula INSS para CLT
  private calculateINSS(salary: number): number {
    const inssRanges = [
      { max: 1412.00, rate: 0.075 },
      { max: 2666.68, rate: 0.09 },
      { max: 4000.03, rate: 0.12 },
      { max: 7786.02, rate: 0.14 }
    ];
    
    let inss = 0;
    let remainingSalary = salary;
    let previousMax = 0;

    for (const range of inssRanges) {
      if (remainingSalary > 0) {
        const baseCalc = Math.min(remainingSalary, range.max - previousMax);
        inss += baseCalc * range.rate;
        remainingSalary -= baseCalc;
        previousMax = range.max;
      }
    }

    return Number(inss.toFixed(2));
  }

  // Calcula IRRF para CLT
  private calculateIRRF(salary: number, inss: number): number {
    const baseCalc = salary - inss;
    
    if (baseCalc <= 2259.20) return 0;
    if (baseCalc <= 2826.65) return (baseCalc * 0.075) - 169.44;
    if (baseCalc <= 3751.05) return (baseCalc * 0.15) - 381.44;
    if (baseCalc <= 4664.68) return (baseCalc * 0.225) - 662.77;
    return (baseCalc * 0.275) - 896.00;
  }

  // Calcula FGTS para CLT
  private calculateFGTS(salary: number): number {
    return salary * 0.08;
  }

  // Calcula horas extras
  private calculateOvertime(baseSalary: number, overtimeHours: number, isCSLT: boolean): number {
    const hourlyRate = baseSalary / 220; // 220 = horas mensais padrão
    const overtimeRate = isCSLT ? 1.5 : 1; // 50% adicional para CLT
    return Number((hourlyRate * overtimeHours * overtimeRate).toFixed(2));
  }

  // Processa a folha de pagamento para um funcionário
  public async calculatePayroll(worker: IWorker, overtimeHours: number = 0): Promise<PayrollCalculation> {
    const baseSalary = Number(worker.salario);
    const isCLT = worker.contract === 'CLT';
    const overtimePay = this.calculateOvertime(baseSalary, overtimeHours, isCLT);
    const grossSalary = baseSalary + overtimePay;

    if (isCLT) {
      // Cálculos para CLT
      const inss = this.calculateINSS(grossSalary);
      const irrf = this.calculateIRRF(grossSalary, inss);
      const fgts = this.calculateFGTS(grossSalary);
      const deductions = inss + irrf;

      return {
        baseSalary,
        overtimePay,
        deductions,
        totalSalary: grossSalary - deductions,
        inss,
        fgts,
        irrf
      };
    } else {
      // Para PJ não há deduções
      return {
        baseSalary,
        overtimePay,
        deductions: 0,
        totalSalary: grossSalary
      };
    }
  }

  // Processa a folha para todos os funcionários
  public async processPayroll(month: number, year: number) {
    try {
      // Busca todos os funcionários
      const response = await axios.get('/api/workers');
      const workers = response.data;

      // Processa a folha para cada funcionário
      const payrollResults = await Promise.all(
        workers.map(async (worker: IWorker) => {
          const calculation = await this.calculatePayroll(worker);
          
          return {
            id: worker._id,
            employeeId: worker._id,
            employeeName: worker.name,
            contract: worker.contract,
            month,
            year,
            baseSalary: calculation.baseSalary,
            overtimePay: calculation.overtimePay,
            deductions: calculation.deductions,
            totalSalary: calculation.totalSalary,
            inss: calculation.inss,
            fgts: calculation.fgts,
            irrf: calculation.irrf,
            status: 'processed'
          };
        })
      );

      // Salva os resultados no banco
      await axios.post('/api/payroll/process', {
        payrolls: payrollResults,
        month,
        year
      });

      return payrollResults;
    } catch (error) {
      console.error('Erro ao processar folha:', error);
      throw error;
    }
  }
}

export const payrollService = new PayrollService();