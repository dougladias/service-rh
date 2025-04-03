import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PDFDocument from 'pdfkit';

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  data: Record<string, unknown>[];
  columns: { key: string; header: string; format?: (value: string | number | Date | boolean | null | undefined) => string }[];
  footerText?: string;
}

// Função para formatar valores monetários
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função para exportar dados para PDF usando PDFKit
export async function exportToPdf(options: PdfExportOptions): Promise<Buffer> {
  const {
    title,
    subtitle,
    data,
    columns,
    footerText = 'Documento gerado automaticamente pelo sistema',
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Criar um buffer para armazenar o PDF
      const chunks: Buffer[] = [];
      
      // Criar um novo documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: title,
          Author: 'Sistema de Relatórios',
          Subject: subtitle || title,
          Keywords: 'relatório, pdf, exportação',
          Creator: 'Sistema de Relatórios',
          Producer: 'PDFKit'
        }
      });
      
      // Coletar chunks do documento
      doc.on('data', (chunk) => chunks.push(chunk));
      
      // Quando o documento estiver finalizado, combinar os chunks e resolver a Promise
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      
      // Configuração de fonte e estilos
      doc.font('Helvetica-Bold');
      doc.fontSize(18);
      doc.text(title, { align: 'center' });
      
      if (subtitle) {
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.font('Helvetica');
        doc.text(subtitle, { align: 'center' });
      }
      
      // Data de geração
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, { align: 'center' });
      
      // Linha divisória
      doc.moveDown();
      doc.moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke();
      doc.moveDown();
      
      // Definir larguras das colunas
      const tableWidth = doc.page.width - 100; // Margem de 50px em cada lado
      const colWidths: number[] = [];
      
      // Calcular largura média da coluna
      const avgColWidth = tableWidth / columns.length;
      
      // Ajustar larguras com base no comprimento do cabeçalho
      let totalAllocatedWidth = 0;
      
      for (let i = 0; i < columns.length; i++) {
        // Largura mínima baseada no tamanho do cabeçalho
        const headerLength = columns[i].header.length;
        const minColWidth = Math.max(30, headerLength * 6);
        
        // Largura máxima não deve exceder em muito a média
        const maxColWidth = avgColWidth * 1.5;
        
        // Definir largura dentro dos limites
        colWidths[i] = Math.min(maxColWidth, Math.max(minColWidth, avgColWidth));
        
        totalAllocatedWidth += colWidths[i];
      }
      
      // Ajustar proporcionalmente se o total for diferente da largura disponível
      if (totalAllocatedWidth !== tableWidth) {
        const scaleFactor = tableWidth / totalAllocatedWidth;
        for (let i = 0; i < colWidths.length; i++) {
          colWidths[i] *= scaleFactor;
        }
      }
      
      // Desenhar cabeçalho da tabela
      doc.font('Helvetica-Bold');
      doc.fontSize(10);
      
      let xPos = 50;
      let yPos = doc.y;
      
      // Retângulo de fundo para o cabeçalho
      doc.fillColor('#f2f2f2');
      doc.rect(xPos, yPos, tableWidth, 20).fill();
      
      // Textos do cabeçalho
      doc.fillColor('#000000');
      for (let i = 0; i < columns.length; i++) {
        doc.text(columns[i].header, xPos + 5, yPos + 5, {
          width: colWidths[i] - 10,
          height: 20,
          align: 'left'
        });
        xPos += colWidths[i];
      }
      
      // Desenhar linhas de dados
      doc.font('Helvetica');
      yPos += 20; // Mover para a próxima linha após o cabeçalho
      
      // Alternar cores para linhas da tabela
      let rowEven = false;
      
      for (const item of data) {
        // Verificar se precisamos de uma nova página
        if (yPos + 20 > doc.page.height - 70) {
          doc.addPage({
            layout: 'landscape',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
          });
          yPos = 50;
        }
        
        // Alternar cor de fundo
        if (rowEven) {
          doc.fillColor('#f9f9f9');
          doc.rect(50, yPos, tableWidth, 20).fill();
        }
        rowEven = !rowEven;
        
        // Dados da linha
        xPos = 50;
        doc.fillColor('#000000');
        
        for (let i = 0; i < columns.length; i++) {
          const value = item[columns[i].key];
          const formatFn = columns[i].format;
          const formattedValue = formatFn && (
            typeof value === 'string' || 
            typeof value === 'number' || 
            typeof value === 'boolean' || 
            value instanceof Date || 
            value === null || 
            value === undefined
          ) 
            ? formatFn(value) 
            : (value === null || value === undefined 
                ? '-' 
                : value instanceof Date 
                  ? format(value, 'dd/MM/yyyy', { locale: ptBR })
                  : String(value));
          
          doc.text(formattedValue, xPos + 5, yPos + 5, {
            width: colWidths[i] - 10,
            height: 20,
            align: 'left'
          });
          
          xPos += colWidths[i];
        }
        
        // Desenhar linha divisória
        doc.strokeColor('#dddddd');
        doc.moveTo(50, yPos + 20)
          .lineTo(doc.page.width - 50, yPos + 20)
          .stroke();
        
        yPos += 20; // Mover para a próxima linha
      }
      
      // Adicionar rodapé
      doc.fontSize(8);
      doc.font('Helvetica');
      doc.fillColor('#666666');
      doc.text(footerText, 50, doc.page.height - 50, {
        align: 'center',
        width: doc.page.width - 100
      });
      
      // Adicionar número de página em todas as páginas
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8);
        doc.text(`Página ${i + 1} de ${totalPages}`,
          50, doc.page.height - 30,
          { align: 'right', width: doc.page.width - 100 }
        );
      }
      
      // Finalizar o documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}