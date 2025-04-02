import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Worker from '@/models/Worker';
import { exportToPdf } from '@/utils/pdf-export';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { startOfMonth, endOfMonth } from 'date-fns';

// Define the type for worker logs
interface WorkerLog {
  date?: Date | string;
  entryTime?: Date | string;
  leaveTime?: Date | string;
  faltou?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectToDatabase();
    
    const { month, year, format: outputFormat = 'pdf' } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Mês e ano são obrigatórios' });
    }
    
    // Converter para números
    const monthNum = parseInt(month as string);
    const yearNum = parseInt(year as string);
    
    // Data de início e fim do mês
    const startDate = startOfMonth(new Date(yearNum, monthNum - 1));
    const endDate = endOfMonth(new Date(yearNum, monthNum - 1));
    
    // Nome do mês por extenso
    const monthName = format(startDate, 'MMMM', { locale: ptBR });
    
    // Buscar todos os trabalhadores ativos
    const workers = await Worker.find({ active: true });
    
    // Array para armazenar os dados do relatório
    const timesheetRecords = [];
    
    // Para cada trabalhador, buscar registros de ponto do mês
    for (const worker of workers) {
      // Filtrar logs que correspondem ao mês/ano especificado
      const logsThisMonth = worker.logs.filter((log: WorkerLog) => {
        // Considerar logs com data ou entryTime dentro do mês
        const logDate = log.date ? new Date(log.date) : 
                        log.entryTime ? new Date(log.entryTime) : null;
        
        if (!logDate) return false;
        
        return logDate >= startDate && logDate <= endDate;
      });
      
      if (logsThisMonth.length > 0) {
        // Processar cada log do funcionário
        for (const log of logsThisMonth) {
          // Determinar a data do registro
          const logDate = log.date ? new Date(log.date) : 
                         log.entryTime ? new Date(log.entryTime) : null;
          
          // Calcular total de horas se tiver entrada e saída
          let totalHours = null;
          if (log.entryTime && log.leaveTime) {
            const entry = new Date(log.entryTime);
            const leave = new Date(log.leaveTime);
            const diffMs = leave.getTime() - entry.getTime();
            totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // Arredondado para 1 casa decimal
          }
          
          timesheetRecords.push({
            name: worker.name,
            date: logDate,
            entryTime: log.entryTime,
            leaveTime: log.leaveTime,
            totalHours,
            status: log.faltou ? 'Ausente' : 
                   !log.entryTime ? 'Ausente' : 
                   !log.leaveTime ? 'Sem saída' : 'Presente'
          });
        }
      } else {
        // Se não há registros, adicionar uma entrada indicando ausência de dados
        timesheetRecords.push({
          name: worker.name,
          date: null,
          entryTime: null,
          leaveTime: null,
          totalHours: null,
          status: 'Sem registros'
        });
      }
    }
    
    // Ordenar por nome e data
    timesheetRecords.sort((a, b) => {
      // Primeiro por nome
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      
      // Depois por data
      if (!a.date && b.date) return 1;
      if (a.date && !b.date) return -1;
      if (!a.date && !b.date) return 0;
      
      return a.date!.getTime() - b.date!.getTime();
    });
    
    // Verificar o formato de saída
    if (outputFormat === 'pdf') {
      // Configurar colunas do relatório
      const columns = [
        { key: 'name', header: 'Funcionário' },
        { 
          key: 'date', 
          header: 'Data',
          format: (value: Date | null) => value ? format(value, 'dd/MM/yyyy') : '-'
        },
        { 
          key: 'entryTime', 
          header: 'Entrada',
          format: (value: Date | null) => value ? format(new Date(value), 'HH:mm') : '-'
        },
        { 
          key: 'leaveTime', 
          header: 'Saída',
          format: (value: Date | null) => value ? format(new Date(value), 'HH:mm') : '-'
        },
        { 
          key: 'totalHours', 
          header: 'Total Horas',
          format: (value: number | null) => value ? value.toString() : '-'
        },
        { 
          key: 'status', 
          header: 'Status'
        }
      ];
      
      // Exportar para PDF
      const pdfBuffer = await exportToPdf({
        title: 'Relatório de Controle de Ponto',
        subtitle: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${yearNum}`,
        filename: `relatorio_ponto_${monthNum}_${yearNum}.pdf`,
        data: timesheetRecords,
        columns
      });
      
      // Configurar cabeçalhos da resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio_ponto_${monthNum}_${yearNum}.pdf`);
      
      // Enviar o PDF
      return res.send(pdfBuffer);
    } else {
      // Formato não suportado
      return res.status(400).json({ message: 'Formato de saída não suportado' });
    }
  } catch (error) {
    console.error('Erro ao exportar relatório de controle de ponto:', error);
    return res.status(500).json({
      message: 'Erro ao exportar relatório de controle de ponto',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}