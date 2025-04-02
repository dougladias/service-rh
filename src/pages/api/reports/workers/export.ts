import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Worker from '@/models/Worker';
import { exportToPdf, formatCurrency } from '@/utils/pdf-export';
import { format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectToDatabase();
    
    const { department, format: outputFormat = 'pdf' } = req.query;
    
    // Construir a query com base nos filtros
    const query: Record<string, unknown> = {};
    
    // Filtrar por departamento, se especificado
    if (department && department !== 'all') {
      if (department === 'noDepartment') {
        // Buscar funcionários sem departamento
        query.department = { $exists: false };
      } else {
        // Buscar funcionários do departamento específico
        query.department = department;
      }
    }
    
    // Buscar funcionários com as condições aplicadas
    const workers = await Worker.find(query).sort({ name: 1 });
    
    // Verificar o formato de saída
    if (outputFormat === 'pdf') {
      // Configurar colunas do relatório
      const columns = [
        { key: 'name', header: 'Nome' },
        { key: 'role', header: 'Cargo' },
        { key: 'department', header: 'Departamento' },
        { 
          key: 'admissao', 
          header: 'Data Admissão',
          format: (value: Date) => format(new Date(value), 'dd/MM/yyyy')
        },
        { 
          key: 'salario', 
          header: 'Salário', 
          format: (value: string) => formatCurrency(Number(value))
        },
        { 
          key: 'contract', 
          header: 'Contrato' 
        },
        { 
          key: 'status', 
          header: 'Status',
          format: (value: string) => value === 'active' ? 'Ativo' : 'Inativo'
        }
      ];

      // Gerar subtítulo baseado no filtro de departamento
      let subtitle = 'Todos os departamentos';
      if (department && department !== 'all') {
        if (department === 'noDepartment') {
          subtitle = 'Funcionários sem departamento';
        } else {
          subtitle = `Departamento: ${department}`;
        }
      }
      
      // Exportar para PDF
      const pdfBuffer = await exportToPdf({
        title: 'Relatório de Funcionários',
        subtitle,
        filename: 'relatorio_funcionarios.pdf',
        data: workers,
        columns
      });
      
      // Configurar cabeçalhos da resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio_funcionarios.pdf');
      
      // Enviar o PDF
      return res.send(pdfBuffer);
    } else {
      // Formato não suportado
      return res.status(400).json({ message: 'Formato de saída não suportado' });
    }
  } catch (error) {
    console.error('Erro ao exportar relatório de funcionários:', error);
    return res.status(500).json({
      message: 'Erro ao exportar relatório de funcionários',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}