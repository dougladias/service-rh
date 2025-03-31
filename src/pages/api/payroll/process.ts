import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import mongoose from 'mongoose';

// Definindo interfaces
interface IWorker {
  _id: mongoose.Types.ObjectId;
  name: string;
  salario?: string;
  contract: 'CLT' | 'PJ';
  status: string;
}

interface IPayroll {
  employeeId: mongoose.Types.ObjectId;
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
  status: 'pending' | 'processed' | 'paid';
  processedAt?: Date;
}

// Schema do Holerite
const PayrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  contract: {
    type: String,
    enum: ['CLT', 'PJ'],
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  baseSalary: {
    type: Number,
    required: true
  },
  overtimePay: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    required: true
  },
  totalSalary: {
    type: Number,
    required: true
  },
  inss: {
    type: Number
  },
  fgts: {
    type: Number
  },
  irrf: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'processed'
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
});

// Definir o modelo se ainda não existe
const PayrollModel = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Endpoint de folha de pagamento acessado:', {
    method: req.method,
    query: req.query
  });

  try {
    // Conectar ao banco de dados
    await connectToDatabase();

    // Permitir GET para buscar folhas e POST para processar
    switch (req.method) {
      case 'GET':
        try {
          const { month, year } = req.query;

          // Validar parâmetros
          if (!month || !year) {
            return res.status(400).json({
              message: 'Mês e ano são obrigatórios',
              query: req.query
            });
          }

          console.log(`Buscando folhas para: ${month}/${year}`);

          // Buscar holerites para o mês e ano especificados
          const payrolls = await PayrollModel.find({
            month: parseInt(month as string),
            year: parseInt(year as string)
          }).sort({ employeeName: 1 });

          console.log(`Encontradas ${payrolls.length} folhas para ${month}/${year}`);

          return res.status(200).json({
            message: 'Folhas de pagamento recuperadas com sucesso',
            payrolls
          });
        } catch (error) {
          console.error('Erro ao buscar folhas de pagamento:', error);
          return res.status(500).json({
            message: 'Erro ao buscar folhas de pagamento',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }

      case 'POST':
        try {
          const { month, year } = req.body;

          if (!month || !year) {
            return res.status(400).json({
              message: 'Mês e ano são obrigatórios',
              body: req.body
            });
          }

          console.log(`Processando folha para: ${month}/${year}`);

          // Buscar todos os funcionários ativos
          const workers: IWorker[] = await mongoose.model('Worker').find({ status: 'active' });

          if (!workers || workers.length === 0) {
            return res.status(404).json({
              message: 'Nenhum funcionário encontrado. Cadastre funcionários primeiro.'
            });
          }

          // Deletar folhas existentes para este mês/ano
          await PayrollModel.deleteMany({
            month: parseInt(month.toString()),
            year: parseInt(year.toString())
          });
          console.log(`Folhas existentes para ${month}/${year} foram excluídas`);

          // Array para armazenar as folhas processadas
          const processedPayrolls: IPayroll[] = [];

          // Processar cada funcionário
          for (const worker of workers) {
            try {
              // Obter salário base do funcionário
              const baseSalary = parseFloat(worker.salario || '0');

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
                if (baseCalc <= 2826.65) return (baseCalc * 0.075) - 169.44;
                if (baseCalc <= 3751.05) return (baseCalc * 0.15) - 381.44;
                if (baseCalc <= 4664.68) return (baseCalc * 0.225) - 662.77;
                return (baseCalc * 0.275) - 896.00;
              };

              // Função para calcular FGTS
              const calculateFGTS = (salary: number): number => {
                return Number((salary * 0.08).toFixed(2));
              };

              // No processamento de cada funcionário
              let inss = 0;
              let fgts = 0;
              let irrf = 0;
              let deductions = 0;
              
              if (worker.contract === 'CLT') {
                // Cálculo do INSS (progressivo)
                inss = calculateINSS(baseSalary);

                // Cálculo do FGTS
                fgts = calculateFGTS(baseSalary);

                // Cálculo do IRRF (considerando INSS)
                irrf = calculateIRRF(baseSalary, inss);

                // Total de deduções
                deductions = inss + irrf;
              }

              // Cálculo do salário líquido
              const totalSalary = baseSalary - deductions;
              
              // Criar objeto do holerite
              const payroll = {
                employeeId: worker._id,
                employeeName: worker.name,
                contract: worker.contract,
                month: parseInt(month.toString()),
                year: parseInt(year.toString()),
                baseSalary,
                deductions,
                totalSalary,
                inss,
                fgts,
                irrf,
                status: 'processed' as const,
                processedAt: new Date()
              };
              
              // Salvar no MongoDB
              const savedPayroll = await PayrollModel.create(payroll);
              processedPayrolls.push(savedPayroll);

            } catch (workerError) {
              console.error(`Erro ao processar funcionário ${worker.name}:`, workerError);
            }
          }

          return res.status(200).json({
            message: 'Folha de pagamento processada com sucesso',
            payrolls: processedPayrolls
          });
        } catch (error) {
          console.error('Erro ao processar folha de pagamento:', error);
          return res.status(500).json({
            message: 'Erro ao processar folha de pagamento',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (topLevelError) {
    console.error('Erro crítico no handler:', topLevelError);
    return res.status(500).json({
      message: 'Erro crítico no processamento',
      error: topLevelError instanceof Error ? topLevelError.message : 'Erro desconhecido'
    });
  }
}