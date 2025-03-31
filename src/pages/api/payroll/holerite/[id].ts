// src/pages/api/payroll/holerite/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/api/mongodb';
import Worker from '@/models/Worker'; // Modelo de funcionário
import { EmployeeBenefit } from '@/models/Benefit'; // Modelos de benefícios

// Schema do Holerite (mantido igual aos outros arquivos de payroll)
const PayrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
  },
  employeeName: { type: String, required: true },
  contract: { type: String, enum: ['CLT', 'PJ'], required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  baseSalary: { type: Number, required: true },
  overtimePay: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  deductions: { type: Number, required: true },
  totalSalary: { type: Number, required: true },
  inss: { type: Number },
  fgts: { type: Number },
  irrf: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'processed',
  },
  processedAt: { type: Date, default: Date.now },
});

// Função auxiliar para formatar moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função para calcular INSS (tabela 2024)
const calculateINSS = (salary: number): number => {
  const inssRanges = [
    { max: 1320.00, rate: 0.075 },
    { max: 2571.29, rate: 0.09 },
    { max: 3856.94, rate: 0.12 },
    { max: 7507.49, rate: 0.14 }
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
};

// Função para calcular IRRF (tabela 2024)
const calculateIRRF = (salary: number, inss: number): number => {
  const baseCalc = salary - inss;

  if (baseCalc <= 2259.20) return 0;
  if (baseCalc <= 2826.65) return Number(((baseCalc * 0.075) - 169.44).toFixed(2));
  if (baseCalc <= 3751.05) return Number(((baseCalc * 0.15) - 381.44).toFixed(2));
  if (baseCalc <= 4664.68) return Number(((baseCalc * 0.225) - 662.77).toFixed(2));
  return Number(((baseCalc * 0.275) - 896.00).toFixed(2));
};

// Função para calcular FGTS
const calculateFGTS = (salary: number): number => {
  return Number((salary * 0.08).toFixed(2));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Conectar ao banco de dados
    await connectToDatabase();

    // Obter o ID do holerite
    const { id } = req.query;

    // Validar ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID do holerite inválido' });
    }

    // Definir o modelo se ainda não existe
    const PayrollModel = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);

    // Buscar o holerite
    const payroll = await PayrollModel.findById(id);

    if (!payroll) {
      return res.status(404).json({ message: 'Holerite não encontrado' });
    }

    // Função para converter salário com tratamento seguro
    const parseSalary = (salaryStr: string): number => {
      try {
        // Remove qualquer caractere que não seja número, vírgula ou ponto
        const cleanedStr = salaryStr.replace(/[^\d,.-]/g, '').replace(',', '.');
        
        // Converte para número
        const salary = parseFloat(cleanedStr);
        
        // Verifica se é um número válido
        return !isNaN(salary) ? salary : 0;
      } catch (error) {
        console.error('Erro ao converter salário:', error);
        return 0;
      }
    };

    // Buscar detalhes do funcionário
    const worker = await Worker.findById(payroll.employeeId);

    if (!worker) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    // Converter salário do worker
    const workerSalary = parseSalary(worker.salario || '0');

    // Buscar benefícios do funcionário
    const employeeBenefits = await EmployeeBenefit.find({ 
      employeeId: payroll.employeeId, 
      status: 'active' 
    }).populate('benefitTypeId');

    // Definir o mês por extenso
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mesExtenso = meses[payroll.month - 1];

    // Para PJ, todos os benefícios são considerados sem desconto
    const benefitsWithoutDiscount = payroll.contract === 'PJ' 
      ? employeeBenefits.reduce((total, benefit) => total + benefit.value, 0)
      : employeeBenefits
          .filter(benefit => !benefit.benefitTypeId.hasDiscount)
          .reduce((total, benefit) => total + benefit.value, 0);

    // Calcular valores se estiverem zerados
    let inssValue = 0;
    let irrfValue = 0; 
    let fgtsValue = 0;
    let totalDescontos = payroll.deductions || 0;

    if (payroll.contract === 'CLT') {
      // Se os valores estiverem zerados ou não existirem, calcular novamente
      inssValue = payroll.inss || calculateINSS(workerSalary);
      fgtsValue = payroll.fgts || calculateFGTS(workerSalary);
      irrfValue = payroll.irrf || calculateIRRF(workerSalary, inssValue);
      
      // Se deductions for zero, recalcular
      if (totalDescontos === 0) {
        const benefitsDeductions = employeeBenefits
          .filter(benefit => benefit.benefitTypeId.hasDiscount)
          .reduce((total, benefit) => total + benefit.value, 0);
        
        totalDescontos = inssValue + irrfValue + benefitsDeductions;
      }
    }

    // Calcular salário líquido considerando as deduções
    const totalSalaryWithBenefits = workerSalary + 
      (payroll.overtimePay || 0) + 
      benefitsWithoutDiscount - 
      totalDescontos;

    // Renderizar como HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=holerite_${payroll.employeeName.replace(/\s+/g, '_')}_${payroll.month}_${payroll.year}.html`
    );

    // HTML do holerite
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Holerite - ${payroll.employeeName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RECIBO DE PAGAMENTO</h1>
          <p>Competência: ${mesExtenso}/${payroll.year}</p>
        </div>

        <div class="info">
          <h2>DADOS DO FUNCIONÁRIO</h2>
          <p>Nome: ${payroll.employeeName}</p>
          <p>Tipo de Contrato: ${payroll.contract}</p>
          <p>Matrícula: ${payroll.employeeId}</p>
          <p>Salário Base Registrado: ${formatCurrency(workerSalary)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Referência</th>
              <th>Proventos</th>
              <th>Descontos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salário Base</td>
              <td>30 dias</td>
              <td>${formatCurrency(workerSalary)}</td>
              <td>-</td>
            </tr>
            ${payroll.overtimePay > 0 ? `
              <tr>
                <td>Horas Extras</td>
                <td>${payroll.overtimeHours}h</td>
                <td>${formatCurrency(payroll.overtimePay)}</td>
                <td>-</td>
              </tr>
            ` : ''}
            ${employeeBenefits
              .filter(benefit => !benefit.benefitTypeId.hasDiscount)
              .map(benefit => `
              <tr>
                <td>${benefit.benefitTypeId.name}</td>
                <td>-</td>
                <td>${formatCurrency(benefit.value)}</td>
                <td>-</td>
              </tr>
            `).join('')}
            ${payroll.contract === 'CLT' ? `
              <tr>
                <td>INSS</td>
                <td>-</td>
                <td>-</td>
                <td>${formatCurrency(inssValue)}</td>
              </tr>
              <tr>
                <td>IRRF</td>
                <td>-</td>
                <td>-</td>
                <td>${formatCurrency(irrfValue)}</td>
              </tr>
              ${employeeBenefits
                .filter(benefit => benefit.benefitTypeId.hasDiscount)
                .map(benefit => `
                <tr>
                  <td>${benefit.benefitTypeId.name}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>${formatCurrency(benefit.value)}</td>
                </tr>
              `).join('')}
              <tr>
                <td>FGTS (Depósito)</td>
                <td>-</td>
                <td>${formatCurrency(fgtsValue)}</td>
                <td>-</td>
              </tr>
            ` : ''}
          </tbody>
                      <tfoot>
            <tr class="total">
              <td colspan="2">Totais</td>
              <td>${formatCurrency(
                workerSalary + 
                (payroll.overtimePay || 0) + 
                benefitsWithoutDiscount
              )}</td>
              <td>${formatCurrency(totalDescontos)}</td>
            </tr>
            <tr class="total">
              <td colspan="3">Valor Líquido</td>
              <td>${formatCurrency(totalSalaryWithBenefits)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 50px;">
          <div style="float: left; width: 45%; text-align: center;">
            <div style="border-top: 1px solid black; margin-top: 50px; padding-top: 5px;">
              Assinatura do Funcionário
            </div>
          </div>
          <div style="float: right; width: 45%; text-align: center;">
            <div style="border-top: 1px solid black; margin-top: 50px; padding-top: 5px;">
              Assinatura da Empresa
            </div>
          </div>
        </div>

        <div style="clear: both; margin-top: 100px; font-size: 12px;">
          <p>Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
          <p>Código de Autenticação: ${payroll._id}</p>
        </div>
      </body>
      </html>`;

    res.send(html);

  } catch (error) {
    console.error('Erro ao gerar holerite:', error);
    res.status(500).json({
      message: 'Erro ao gerar holerite',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}