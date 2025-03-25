import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import mongoose from 'mongoose';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Endpoint de folha de pagamento acessado:', {
    method: req.method,
    query: req.query
  });

  // Permitir GET para buscar folhas
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
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  } 
  // Método não permitido
  else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}