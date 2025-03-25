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
  overtimeHours?: number;
  deductions: number;
  totalSalary: number;
  inss?: number;
  fgts?: number;
  irrf?: number;
  benefits?: {
    valeTransporte?: number;
    valeRefeicao?: number;
    planoSaude?: number;
  };
  status: 'pending' | 'processed' | 'paid';
  processedAt: Date;
  paidAt?: Date;
}

// Schema para a folha de pagamento
const PayrollSchema = new mongoose.Schema<IPayroll>({
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
    required: true,
    min: 1,
    max: 12 
  },
  year: { 
    type: Number, 
    required: true,
    min: 2020,
    max: 2100 
  },
  baseSalary: { 
    type: Number, 
    required: true,
    min: 0 
  },
  overtimePay: { 
    type: Number, 
    required: true,
    default: 0,
    min: 0 
  },
  overtimeHours: { 
    type: Number,
    default: 0,
    min: 0 
  },
  deductions: { 
    type: Number, 
    required: true,
    default: 0,
    min: 0 
  },
  totalSalary: { 
    type: Number, 
    required: true,
    min: 0 
  },
  inss: { 
    type: Number,
    min: 0 
  },
  fgts: { 
    type: Number,
    min: 0 
  },
  irrf: { 
    type: Number,
    min: 0 
  },
  benefits: {
    valeTransporte: { type: Number, min: 0 },
    valeRefeicao: { type: Number, min: 0 },
    planoSaude: { type: Number, min: 0 }
  },
  status: { 
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending'
  },
  processedAt: { 
    type: Date, 
    default: Date.now 
  },
  paidAt: { 
    type: Date 
  }
});

// Índices para otimização de consultas
PayrollSchema.index({ month: 1, year: 1 });
PayrollSchema.index({ employeeId: 1 });
PayrollSchema.index({ status: 1 });

// Middleware para validação antes de salvar
PayrollSchema.pre('save', function(next) {
  // Garante que totalSalary seja positivo
  if (this.totalSalary < 0) {
    next(new Error('Salário total não pode ser negativo'));
    return;
  }

  // Validações específicas para CLT
  if (this.contract === 'CLT') {
    if (this.inss === undefined || this.fgts === undefined) {
      next(new Error('INSS e FGTS são obrigatórios para CLT'));
      return;
    }
  }

  next();
});

// Criar ou obter o modelo
const Payroll = mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ message: `Método ${req.method} não permitido` });
    }
  } catch (error) {
    console.error('Erro na API de folha de pagamento:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor', 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Handler para GET - Busca folhas de pagamento
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { month, year, employeeId, status } = req.query;
  
  // Construir query dinamicamente
  const query: Partial<{
    month: number;
    year: number;
    employeeId: string;
    status: string;
  }> = {};
  
  if (month) query.month = Number(month);
  if (year) query.year = Number(year);
  if (employeeId) query.employeeId = Array.isArray(employeeId) ? employeeId[0] : employeeId;
  if (status) query.status = Array.isArray(status) ? status[0] : status;

  // Buscar as folhas com os filtros aplicados
  const payrolls = await Payroll.find(query)
    .sort({ processedAt: -1 })
    .populate('employeeId', 'name contract');

  return res.status(200).json(payrolls);
}

// Handler para POST - Processa novas folhas
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { month, year } = req.body;

  // Validar request
  if (!month || !year) {
    return res.status(400).json({ 
      message: 'Dados inválidos. Necessário informar month e year.' 
    });
  }

  // Processar folha de pagamento (exemplo simplificado)
  try {
    // Lógica para processar a folha com base em month e year
    const payrolls = await Payroll.find({ month, year });

    if (payrolls.length === 0) {
      return res.status(404).json({ message: 'Nenhuma folha encontrada para o mês/ano fornecido.' });
    }

    // Atualizar status para "processed"
    await Payroll.updateMany({ month, year }, { status: 'processed' });

    return res.status(200).json({ message: 'Folha processada com sucesso.' });
  } catch (error) {
    console.error('Erro ao processar folha:', error);
    return res.status(500).json({ message: 'Erro interno ao processar folha.' });
  }
}

// Handler para PUT - Atualiza status da folha
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id, status, paidAt } = req.body;

  if (!id || !status) {
    return res.status(400).json({ 
      message: 'ID e status são obrigatórios' 
    });
  }

  // Atualiza o status e, se fornecido, a data de pagamento
  const updateData: Partial<Pick<IPayroll, 'status' | 'paidAt'>> = { status };
  if (status === 'paid' && paidAt) {
    updateData.paidAt = new Date(paidAt);
  }

  const updatedPayroll = await Payroll.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedPayroll) {
    return res.status(404).json({ 
      message: 'Folha de pagamento não encontrada' 
    });
  }

  return res.status(200).json(updatedPayroll);
}