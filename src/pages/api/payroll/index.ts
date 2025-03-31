import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/api/mongodb';

// Schema do Holerite (igual aos outros arquivos)
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
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  baseSalary: {
    type: Number,
    required: true
  },
  totalSalary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'processed'
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar se é um método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Conectar ao banco de dados
    await connectToDatabase();

    // Obter mês e ano dos parâmetros da query
    const { month, year } = req.query;

    // Validar parâmetros
    if (!month || !year) {
      return res.status(400).json({ 
        message: 'Mês e ano são obrigatórios',
        query: req.query
      });
    }

    // Definir modelo de Holerite
    const PayrollModel = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);

    // Buscar holerites para o mês e ano especificados
    const payrolls = await PayrollModel.find({
      month: parseInt(month as string),
      year: parseInt(year as string)
    }).sort({ employeeName: 1 });

    // Retornar resultados
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
}