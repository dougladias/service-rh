import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';

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

const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);

// Formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectToDatabase();
    const { id } = req.query;

    // Validação do ID
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    // Busca o holerite com dados do funcionário
    const payroll = await Payroll.findById(id).populate('employeeId');

    if (!payroll) {
      return res.status(404).json({ message: 'Holerite não encontrado' });
    }

    // Verifica se employeeId existe no documento do holerite
    if (!payroll.employeeId) {
      return res.status(404).json({ message: 'Dados do funcionário não encontrados' });
    }

    // Cria o documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Holerite - ${payroll.employeeName} - ${payroll.month}/${payroll.year}`,
        Author: 'Sistema RH',
        Subject: 'Holerite',
        Keywords: 'holerite, contracheque, pagamento',
      },
    });

    // Configura os headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=holerite_${payroll.employeeName.replace(/\s+/g, '_')}_${payroll.month}_${
        payroll.year
      }.pdf`
    );

    // Pipe o PDF para a resposta
    doc.pipe(res);

    try {
      // Cabeçalho do Holerite
      doc.image('public/logo.png', 50, 50, { width: 100 }) // Ajuste o caminho do logo
        .fontSize(16)
        .text('RECIBO DE PAGAMENTO', { align: 'center' })
        .moveDown();
    } catch (error) {
      console.error('Erro ao adicionar o logotipo:', error);
    }

    // Informações da Empresa
    doc.fontSize(10)
      .text('EMPRESA EXEMPLO LTDA', { align: 'left' })
      .text('CNPJ: 00.000.000/0001-00')
      .text('Endereço: Rua Exemplo, 123 - São Paulo/SP')
      .moveDown();

    // Informações do Funcionário
    doc.fontSize(12)
      .text('DADOS DO FUNCIONÁRIO', { underline: true })
      .moveDown()
      .fontSize(10);

    const employee = payroll.employeeId;

    try {
      const dadosFuncionario = [
        ['Nome:', payroll.employeeName, 'Matrícula:', employee._id.toString()],
        ['Cargo:', employee.role, 'Admissão:', new Date(employee.admissao).toLocaleDateString('pt-BR')],
        ['CPF:', employee.cpf, 'Tipo Contrato:', payroll.contract],
      ];

      dadosFuncionario.forEach((linha) => {
        doc.text(linha[0], 50, doc.y)
          .text(linha[1], 150, doc.y - doc.currentLineHeight())
          .text(linha[2], 300, doc.y - doc.currentLineHeight())
          .text(linha[3], 400, doc.y - doc.currentLineHeight())
          .moveDown();
      });
    } catch (error) {
      console.error('Erro ao adicionar os dados do funcionário:', error);
    }

    doc.moveDown();

    // Competência
    doc.fontSize(11)
      .text(
        `Referente: ${new Date(payroll.year, payroll.month - 1).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })}`,
        { align: 'right' }
      )
      .moveDown();

    // Tabela de Proventos e Descontos
    const startX = 50;
    let startY = doc.y + 10;

    // Cabeçalho da tabela
    doc.font('Helvetica-Bold')
      .text('Descrição', startX, startY)
      .text('Referência', 250, startY)
      .text('Proventos', 350, startY)
      .text('Descontos', 450, startY);

    // Linha separadora
    startY += 20;
    doc.moveTo(startX, startY).lineTo(550, startY).stroke();

    // Reset fonte
    doc.font('Helvetica');

    // Função helper para adicionar linha
    const addLine = (desc: string, ref: string, prov: string, desc2: string) => {
      startY += 20;
      doc.text(desc, startX, startY)
        .text(ref, 250, startY)
        .text(prov, 350, startY)
        .text(desc2, 450, startY);
    };

    // Salário Base
    addLine('Salário Base', '30d', formatCurrency(payroll.baseSalary), '-');

    // Horas Extras
    if (payroll.overtimePay > 0) {
      addLine('Horas Extras', `${payroll.overtimeHours}h`, formatCurrency(payroll.overtimePay), '-');
    }

    // Descontos CLT
    if (payroll.contract === 'CLT') {
      if (payroll.inss) {
        addLine('INSS', '-', '-', formatCurrency(payroll.inss));
      }
      if (payroll.irrf) {
        addLine('IRRF', '-', '-', formatCurrency(payroll.irrf));
      }
      if (payroll.fgts) {
        addLine('FGTS', '-', formatCurrency(payroll.fgts), '-');
      }
    }

    // Benefícios
    if (payroll.benefits) {
      if (payroll.benefits.valeTransporte) {
        addLine('Vale Transporte', '-', formatCurrency(payroll.benefits.valeTransporte), '-');
      }
      if (payroll.benefits.valeRefeicao) {
        addLine('Vale Refeição', '-', formatCurrency(payroll.benefits.valeRefeicao), '-');
      }
      if (payroll.benefits.planoSaude) {
        addLine('Plano de Saúde', '-', '-', formatCurrency(payroll.benefits.planoSaude));
      }
    }

    // Linha separadora para totais
    startY += 30;
    doc.moveTo(startX, startY).lineTo(550, startY).stroke();

    // Totais
    startY += 20;
    doc.font('Helvetica-Bold')
      .text('Totais:', startX, startY)
      .text(formatCurrency(payroll.baseSalary + payroll.overtimePay), 350, startY)
      .text(formatCurrency(payroll.deductions), 450, startY);

    // Valor Líquido
    startY += 30;
    doc.fontSize(12)
      .text('Valor Líquido:', startX)
      .text(formatCurrency(payroll.totalSalary), 350, startY);

    // Assinaturas
    startY = doc.y + 50;
    doc.fontSize(10)
      .moveTo(50, startY).lineTo(250, startY).stroke()
      .moveTo(300, startY).lineTo(500, startY).stroke()
      .text('Assinatura do Funcionário', 50, startY + 5, { width: 200, align: 'center' })
      .text('Assinatura da Empresa', 300, startY + 5, { width: 200, align: 'center' });

    // Data e hora
    const dataHora = new Date().toLocaleString('pt-BR');
    doc.text(`Emitido em: ${dataHora}`, 50, startY + 50);

    // QR Code ou código de autenticação
    doc.fontSize(8)
      .text(`Autenticação: ${payroll._id}`, 50, doc.page.height - 50);

    // Finaliza o PDF
    doc.end();
  } catch (error) {
    console.error('Erro ao gerar holerite:', error);
    res.status(500).json({
      message: 'Erro ao gerar holerite',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}