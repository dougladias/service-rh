import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import mongoose from 'mongoose';

// Schema do Holerite
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
  benefits: {
    valeTransporte: { type: Number, default: 0 },
    valeRefeicao: { type: Number, default: 0 },
    planoSaude: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending',
  },
  processedAt: { type: Date, default: Date.now },
});

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Recebida requisição para gerar holerite:', {
    method: req.method,
    query: req.query,
    headers: req.headers
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectToDatabase();
    const { id } = req.query;

    // Validação do ID
    if (!id || typeof id !== 'string') {
      console.error('ID não fornecido ou inválido:', id);
      return res.status(400).json({ message: 'ID do holerite é obrigatório' });
    }

    // Verificar se o ID é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('ID de holerite inválido:', id);
      return res.status(400).json({ message: 'ID de holerite inválido' });
    }

    // Busca o holerite
    console.log('Buscando holerite com ID:', id);
    
    // Definir o modelo se ainda não existe
    const PayrollModel = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);
    
    // Buscar o holerite
    const payroll = await PayrollModel.findById(id);
    
    if (!payroll) {
      console.error('Holerite não encontrado para o ID:', id);
      return res.status(404).json({ message: 'Holerite não encontrado' });
    }

    console.log('Holerite encontrado:', payroll.employeeName);

    // Definir o mês por extenso
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mesExtenso = meses[payroll.month - 1];

    // Cria resposta HTML em vez de PDF para teste
    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=holerite_${payroll.employeeName.replace(/\s+/g, '_')}_${payroll.month}_${payroll.year}.html`
    );

    // Gera HTML do holerite
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
              <td>${formatCurrency(payroll.baseSalary)}</td>
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
            ${payroll.contract === 'CLT' ? `
              ${payroll.inss ? `
                <tr>
                  <td>INSS</td>
                  <td>-</td>
                  <td>-</td>
                  <td>${formatCurrency(payroll.inss)}</td>
                </tr>
              ` : ''}
              ${payroll.irrf ? `
                <tr>
                  <td>IRRF</td>
                  <td>-</td>
                  <td>-</td>
                  <td>${formatCurrency(payroll.irrf)}</td>
                </tr>
              ` : ''}
              ${payroll.fgts ? `
                <tr>
                  <td>FGTS (Depósito)</td>
                  <td>-</td>
                  <td>${formatCurrency(payroll.fgts)}</td>
                  <td>-</td>
                </tr>
              ` : ''}
            ` : ''}
            ${payroll.benefits ? `
              ${payroll.benefits.valeTransporte > 0 ? `
                <tr>
                  <td>Vale Transporte</td>
                  <td>-</td>
                  <td>${formatCurrency(payroll.benefits.valeTransporte)}</td>
                  <td>-</td>
                </tr>
              ` : ''}
              ${payroll.benefits.valeRefeicao > 0 ? `
                <tr>
                  <td>Vale Refeição</td>
                  <td>-</td>
                  <td>${formatCurrency(payroll.benefits.valeRefeicao)}</td>
                  <td>-</td>
                </tr>
              ` : ''}
              ${payroll.benefits.planoSaude > 0 ? `
                <tr>
                  <td>Plano de Saúde</td>
                  <td>-</td>
                  <td>-</td>
                  <td>${formatCurrency(payroll.benefits.planoSaude)}</td>
                </tr>
              ` : ''}
            ` : ''}
          </tbody>
          <tfoot>
            <tr class="total">
              <td colspan="2">Totais</td>
              <td>${formatCurrency(payroll.baseSalary + (payroll.overtimePay || 0))}</td>
              <td>${formatCurrency(payroll.deductions)}</td>
            </tr>
            <tr class="total">
              <td colspan="3">Valor Líquido</td>
              <td>${formatCurrency(payroll.totalSalary)}</td>
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
      </html>
    `;

    res.send(html);

  } catch (error) {
    console.error('Erro ao gerar holerite:', error);
    res.status(500).json({
      message: 'Erro ao gerar holerite',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}