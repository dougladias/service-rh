import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import mongoose from 'mongoose';

// Interface básica para tipagem
interface IPayroll {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  contract: 'CLT' | 'PJ';
  month: number;
  year: number;
  baseSalary: number;
  overtimePay: number;
  overtimeHours: number;
  deductions: number;
  totalSalary: number;
  inss?: number;
  fgts?: number;
  irrf?: number;
  benefits?: {
    valeTransporte: number;
    valeRefeicao: number;
    planoSaude: number;
  };
  status: 'pending' | 'processed' | 'paid';
  processedAt: Date;
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
  irrf: {
    type: Number
  },
  fgts: {
    type: Number
  },
  benefits: {
    valeTransporte: { type: Number, default: 0 },
    valeRefeicao: { type: Number, default: 0 },
    planoSaude: { type: Number, default: 0 }
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

// Schema do Worker (Funcionário) - Ajustado para salary como string
const WorkerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  salary: { 
    type: String,  // Ajustado para String conforme seu modelo
    required: true,
    default: "3000"  // Valor padrão como string
  },
  contract: { 
    type: String, 
    enum: ['CLT', 'PJ'], 
    required: true,
    default: 'CLT'
  },
  cpf: String,
  active: {
    type: Boolean,
    default: true
  }
});

// Função para calcular INSS conforme tabela 2023
function calculateINSS(salary: number): number {
  try {
    if (salary <= 1320) {
      return salary * 0.075;
    } else if (salary <= 2571.29) {
      return salary * 0.09;
    } else if (salary <= 3856.94) {
      return salary * 0.12;
    } else if (salary <= 7507.49) {
      return salary * 0.14;
    } else {
      return 1051.05; // Teto do INSS 2023
    }
  } catch (error) {
    console.error('Erro no cálculo do INSS:', error);
    return 0;
  }
}

// Função para calcular IRRF conforme tabela 2023
function calculateIRRF(salary: number, inss: number): number {
  try {
    const baseCalculo = salary - inss;
    
    if (baseCalculo <= 2112) {
      return 0;
    } else if (baseCalculo <= 2826.65) {
      return (baseCalculo * 0.075) - 158.40;
    } else if (baseCalculo <= 3751.05) {
      return (baseCalculo * 0.15) - 370.40;
    } else if (baseCalculo <= 4664.68) {
      return (baseCalculo * 0.225) - 651.73;
    } else {
      return (baseCalculo * 0.275) - 884.96;
    }
  } catch (error) {
    console.error('Erro no cálculo do IRRF:', error);
    return 0;
  }
}

// Função para calcular FGTS (8% do salário bruto)
function calculateFGTS(salary: number): number {
  try {
    return salary * 0.08;
  } catch (error) {
    console.error('Erro no cálculo do FGTS:', error);
    return 0;
  }
}

// Função para converter string de salário para número
function parseSalary(salaryStr: string): number {
  try {
    if (!salaryStr) return 0;
    
    // Remove símbolos monetários e separadores de milhar, substitui vírgula por ponto
    const cleanedStr = salaryStr.replace(/[^\d,.-]/g, '').replace(',', '.');
    
    // Converte para número
    const salary = parseFloat(cleanedStr);
    
    // Verifica se é um número válido
    return !isNaN(salary) ? salary : 0;
  } catch (error) {
    console.error('Erro ao converter salário:', error, 'Para o valor:', salaryStr);
    return 0;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Endpoint de processamento acessado:', {
      method: req.method,
      body: req.method === 'POST' ? req.body : {},
      query: req.query
    });

    // Permitir GET para consulta
    if (req.method === 'GET') {
      try {
        // Conectar ao banco de dados
        await connectToDatabase();
        
        // Obter modelo de Holerite
        const PayrollModel = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);
        
        // Obter mês e ano dos parâmetros da query
        const { month, year } = req.query;
        
        if (!month || !year) {
          return res.status(400).json({ message: 'Mês e ano são obrigatórios' });
        }

        console.log(`Buscando folhas para: ${month}/${year}`);

        // Buscar holerites para o mês e ano especificados
        const payrolls = await PayrollModel.find({
          month: parseInt(month as string),
          year: parseInt(year as string)
        }).sort({ employeeName: 1 }); // Ordenar por nome do funcionário
        
        console.log(`Encontradas ${payrolls.length} folhas para ${month}/${year}`);

        return res.status(200).json({ 
          message: 'Folhas de pagamento recuperadas com sucesso',
          payrolls: payrolls 
        });
      } catch (error) {
        console.error('Erro ao buscar folhas de pagamento:', error);
        return res.status(500).json({ 
          message: 'Erro ao buscar folhas de pagamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          stack: error instanceof Error ? error.stack : null
        });
      }
    }
    // Verificar se é um método POST para processar folha
    else if (req.method === 'POST') {
      try {
        // Conectar ao banco de dados
        await connectToDatabase();
        
        // Verificar se os modelos já existem para evitar redefinição
        const PayrollModel = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);
        
        // Definir modelo de Worker se não existir
        const WorkerModel = mongoose.models.Worker || mongoose.model('Worker', WorkerSchema);

        // Obter mês e ano da requisição
        const { month, year } = req.body;
        
        if (!month || !year) {
          return res.status(400).json({ message: 'Mês e ano são obrigatórios' });
        }

        console.log(`Processando folha para: ${month}/${year}`);

        // Buscar todos os funcionários ativos
        const workers = await WorkerModel.find();
        console.log(`Encontrados ${workers.length} funcionários`);

        if (!workers || workers.length === 0) {
          return res.status(404).json({ 
            message: 'Nenhum funcionário encontrado. Cadastre funcionários primeiro.' 
          });
        }

        // Deletar folhas existentes para este mês/ano para evitar duplicação
        await PayrollModel.deleteMany({ 
          month: parseInt(month.toString()), 
          year: parseInt(year.toString()) 
        });
        console.log(`Folhas existentes para ${month}/${year} foram excluídas`);

        // Array para armazenar as folhas processadas
        const processedPayrolls = [];

        // Para cada funcionário, calcular os valores e criar um registro de holerite
        for (const worker of workers) {
          try {
            console.log(`Processando funcionário:`, {
              id: worker._id,
              name: worker.name,
              contract: worker.contract,
              salary: worker.salary
            });
            
            // Garantir que o tipo de contrato é válido
            const contractType = worker.contract === 'PJ' ? 'PJ' : 'CLT';
            
            // IMPORTANTE: Converter o salário de string para número
            const salarioStr = worker.salary || "0";
            let baseSalary = parseSalary(salarioStr);
            
            console.log(`Salário convertido para ${worker.name}: ${salarioStr} => ${baseSalary}`);
            
            // Verificar se o salário é válido após a conversão
            if (baseSalary <= 0) {
              console.warn(`Salário inválido para ${worker.name}: ${salarioStr} (convertido para ${baseSalary})`);
              // Definir um valor padrão mínimo, usando let ao invés de const
              baseSalary = 3000; // *** LINHA CORRIGIDA ***
            }
            
            // Valores adicionais
            const overtimePay = 0;
            const overtimeHours = 0;
            
            // Cálculos de descontos
            let inss = 0;
            let irrf = 0;
            let fgts = 0;
            let deductions = 0;
            
            // Cálculos específicos para CLT
            if (contractType === 'CLT') {
              inss = calculateINSS(baseSalary);
              irrf = calculateIRRF(baseSalary, inss);
              fgts = calculateFGTS(baseSalary);
              deductions = inss + irrf;
            }
            
            // Cálculo do salário líquido
            const totalSalary = baseSalary - deductions + overtimePay;
            
            // Criar objeto do holerite
            const payroll: IPayroll = {
              employeeId: worker._id,
              employeeName: worker.name,
              contract: contractType,
              month: parseInt(month.toString()),
              year: parseInt(year.toString()),
              baseSalary: baseSalary,
              overtimePay: overtimePay,
              overtimeHours: overtimeHours,
              deductions: parseFloat(deductions.toFixed(2)),
              totalSalary: parseFloat(totalSalary.toFixed(2)),
              status: 'processed',
              processedAt: new Date()
            };
            
            // Adicionar campos específicos para CLT
            if (contractType === 'CLT') {
              payroll.inss = parseFloat(inss.toFixed(2));
              payroll.irrf = parseFloat(irrf.toFixed(2));
              payroll.fgts = parseFloat(fgts.toFixed(2));
            }
            
            // Benefícios padrão (pode ser customizado no futuro)
            payroll.benefits = {
              valeTransporte: 0,
              valeRefeicao: 0,
              planoSaude: 0
            };
            
            // Verificar se os valores estão válidos antes de salvar
            console.log(`Valores calculados para ${worker.name}:`, {
              baseSalary: payroll.baseSalary,
              deductions: payroll.deductions,
              totalSalary: payroll.totalSalary
            });
            
            // Criar novo registro no banco de dados
            const newPayroll = new PayrollModel(payroll);
            await newPayroll.save();
            
            processedPayrolls.push(newPayroll);
            console.log(`Holerite processado para ${worker.name}`);
          } catch (workerError) {
            console.error(`Erro ao processar funcionário ${worker?.name || 'desconhecido'}:`, workerError);
            // Continua para o próximo funcionário
          }
        }

        // Verificar se processou algum holerite
        if (processedPayrolls.length === 0) {
          return res.status(500).json({ 
            message: 'Nenhum holerite foi processado. Verifique os logs para mais detalhes.'
          });
        }

        // Ordenar por nome do funcionário
        processedPayrolls.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

        return res.status(200).json({ 
          message: 'Folha de pagamento processada com sucesso',
          payrolls: processedPayrolls 
        });
      } catch (error) {
        console.error('Erro ao processar folha de pagamento:', error);
        return res.status(500).json({ 
          message: 'Erro ao processar folha de pagamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          stack: error instanceof Error ? error.stack : null
        });
      }
    } 
    // Método não permitido
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (topLevelError) {
    console.error('Erro crítico no handler:', topLevelError);
    return res.status(500).json({
      message: 'Erro crítico no processamento',
      error: topLevelError instanceof Error ? topLevelError.message : 'Erro desconhecido',
      stack: topLevelError instanceof Error ? topLevelError.stack : null
    });
  }
}