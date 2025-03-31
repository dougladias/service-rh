import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

// Schema do Holerite com índices e otimizações
const PayrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true  // Adicionar índice para melhorar performance
  },
  employeeName: {
    type: String, 
    required: true,
    index: true  // Índice para busca por nome
  },
  contract: {
    type: String,
    enum: ['CLT', 'PJ'],
    required: true
  },
  month: {
    type: Number,
    required: true,
    index: true  // Índice para busca por mês
  },
  year: {
    type: Number,
    required: true,
    index: true  // Índice para busca por ano
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
    default: 'processed',
    index: true  // Índice para busca por status
  },
  processedAt: {
    type: Date,
    default: Date.now,
    index: true  // Índice para ordenação
  }
}, {
  // Configurações de otimização
  autoIndex: true,  // Garantir criação de índices
  timestamps: true  // Adicionar createdAt e updatedAt automaticamente
});

// Criar modelo com verificação de existência
const PayrollModel = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Conectar ao banco de dados com timeout configurado
    await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,  // Tempo de seleção do servidor
      socketTimeoutMS: 45000,  // Timeout para operações de socket
      connectTimeoutMS: 10000  // Tempo máximo para conectar
    });

    // Log para depuração
    console.log('Conectado ao MongoDB, processando solicitação de folha de pagamento');

    // Verificar se é uma requisição GET
    if (req.method === 'GET') {
      const { month, year } = req.query;

      // Validar parâmetros
      if (!month || !year) {
        return res.status(400).json({ 
          message: 'Mês e ano são obrigatórios',
          query: req.query
        });
      }

      try {
        // Buscar folhas de pagamento com tempo limite e populate
        const payrolls = await PayrollModel.find({
          month: parseInt(month as string),
          year: parseInt(year as string)
        })
        .select('-__v')  // Excluir versão do Mongoose
        .lean()  // Retorna objetos JavaScript puros, mais leve
        .sort({ employeeName: 1 });  // Ordenar por nome do funcionário

        // Log para depuração
        console.log(`Encontradas ${payrolls.length} folhas para ${month}/${year}`);

        // Retornar resultados
        return res.status(200).json({ 
          message: 'Folhas de pagamento recuperadas com sucesso',
          payrolls 
        });

      } catch (findError) {
        console.error('Erro ao buscar folhas:', findError);
        return res.status(500).json({ 
          message: 'Erro ao buscar folhas de pagamento',
          error: findError instanceof Error ? findError.message : 'Erro desconhecido'
        });
      }
    } else {
      // Método não permitido
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (connectionError) {
    // Erro de conexão
    console.error('Erro de conexão ao MongoDB:', connectionError);
    return res.status(500).json({ 
      message: 'Erro de conexão ao banco de dados',
      error: connectionError instanceof Error ? connectionError.message : 'Erro desconhecido'
    });
  }
}