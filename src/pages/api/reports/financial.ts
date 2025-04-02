// src/pages/api/reports/financial.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import mongoose from 'mongoose';
import Worker from '@/models/Worker';
import { EmployeeBenefit } from '@/models/Benefit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    const { month, year, department } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: 'Mês e ano são obrigatórios'
      });
    }

    // Definir modelo de Payroll para acessar os dados de folha de pagamento
    const PayrollModel = mongoose.models.Payroll ||
      mongoose.model('Payroll', new mongoose.Schema({
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
        employeeName: String,
        month: Number,
        year: Number,
        department: String,
        baseSalary: Number,
        overtimePay: Number,
        overtimeHours: Number,
        inss: Number,
        fgts: Number,
        irrf: Number,
        deductions: Number,
        totalSalary: Number,
        contract: String,
        status: String
      }));

    // Buscar todos os payrolls do período
    const query: {
      month: number;
      year: number;
      department?: string;
    } = {
      month: parseInt(month as string),
      year: parseInt(year as string)
    };

    // Filtrar por departamento se necessário
    if (department) {
      if (department === 'noDepartment') {
        // Filtrar para funcionários sem departamento
        query.department = undefined;
      } else if (department !== 'all') {
        // Filtrar para um departamento específico
        query.department = department as string;
      }
    }

    // Buscar dados completos da folha
    const payrolls = await PayrollModel.find(query).lean();

    // Buscar dados dos funcionários relacionados
    const employeeIds = payrolls.map(p => p.employeeId);
    const workers = await Worker.find({
      _id: { $in: employeeIds }
    }).lean<Array<{
      _id: mongoose.Types.ObjectId | string;
      department?: string;
    }>>();

    // Buscar benefícios ativos dos funcionários
    const benefits = await EmployeeBenefit.find({
      employeeId: { $in: employeeIds },
      status: 'active'
    }).populate('benefitTypeId').lean();

    // Agrupar benefícios por funcionário
    const benefitsByEmployee = benefits.reduce<Record<string, typeof benefits[0][]>>((acc, benefit) => {
      const empId = benefit.employeeId.toString();
      if (!acc[empId]) {
        acc[empId] = [];
      }
      acc[empId].push(benefit);
      return acc;
    }, {});

    // Calcular valores agregados
    const summary = {
      totalBaseSalary: 0,
      totalOvertimePay: 0,
      totalINSS: 0,
      totalFGTS: 0,
      totalIRRF: 0,
      totalBenefits: 0,
      totalDeductions: 0,
      totalNetSalary: 0
    };

    // Processar dados por departamento
    const departmentData: Record<string, {
      department: string;
      employees: number;
      totalBase: number;
      totalExtra: number;
      totalNet: number;
    }> = {};

    // Calcular totais de benefícios
    let transportVoucher = 0;
    let mealVoucher = 0;
    let otherBenefits = 0;

    // Percorrer todos os registros da folha
    for (const payroll of payrolls) {
      // Adicionar ao resumo geral
      summary.totalBaseSalary += payroll.baseSalary || 0;
      summary.totalOvertimePay += payroll.overtimePay || 0;
      summary.totalINSS += payroll.inss || 0;
      summary.totalFGTS += payroll.fgts || 0;
      summary.totalIRRF += payroll.irrf || 0;
      summary.totalDeductions += payroll.deductions || 0;
      summary.totalNetSalary += payroll.totalSalary || 0;

      // Processar benefícios do funcionário
      const employeeBenefits = benefitsByEmployee[payroll.employeeId.toString()] || [];

      // Calcular totais por tipo de benefício
      for (const benefit of employeeBenefits) {
        const benefitType = benefit.benefitTypeId;

        if (benefitType.name.toLowerCase().includes('transporte')) {
          transportVoucher += benefit.value;
        } else if (benefitType.name.toLowerCase().includes('refeição') ||
          benefitType.name.toLowerCase().includes('alimentação')) {
          mealVoucher += benefit.value;
        } else {
          otherBenefits += benefit.value;
        }
      }

      // Agregar por departamento
      const worker = workers.find(w => w._id.toString() === payroll.employeeId.toString());
      const dept = worker?.department || payroll.department || 'Sem Departamento';

      if (!departmentData[dept]) {
        departmentData[dept] = {
          department: dept,
          employees: 0,
          totalBase: 0,
          totalExtra: 0,
          totalNet: 0
        };
      }

      departmentData[dept].employees++;
      departmentData[dept].totalBase += payroll.baseSalary || 0;
      departmentData[dept].totalExtra += payroll.overtimePay || 0;
      departmentData[dept].totalNet += payroll.totalSalary || 0;
    }

    // Calcular total de benefícios
    summary.totalBenefits = transportVoucher + mealVoucher + otherBenefits;

    // Formatar departamentos como array para resposta
    const departmentArray = Object.values(departmentData).map((dept, index) => ({
      id: index + 1,
      ...dept
    }));

    // Formatar dados de resumo para a tabela
    const summaryData = [
      { id: 1, description: 'Total Salários Base', value: summary.totalBaseSalary },
      { id: 2, description: 'Total Horas Extras', value: summary.totalOvertimePay },
      { id: 3, description: 'Total INSS', value: summary.totalINSS },
      { id: 4, description: 'Total FGTS', value: summary.totalFGTS },
      { id: 5, description: 'Total IRRF', value: summary.totalIRRF },
      { id: 6, description: 'Total Vale Transporte', value: transportVoucher },
      { id: 7, description: 'Total Vale Alimentação/Refeição', value: mealVoucher },
      { id: 8, description: 'Total Outros Benefícios', value: otherBenefits },
      { id: 9, description: 'Total Líquido Pago', value: summary.totalNetSalary }
    ];

    // Retornar dados completos
    return res.status(200).json({
      payrolls,
      summary,
      summaryData,
      departmentData: departmentArray,
      transportVoucher,
      mealVoucher,
      otherBenefits
    });

  } catch (error) {
    console.error('Erro na API de relatórios financeiros:', error);
    return res.status(500).json({
      message: 'Erro ao processar relatórios financeiros',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}