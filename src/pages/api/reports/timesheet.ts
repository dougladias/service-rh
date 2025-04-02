import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Worker from '@/models/Worker';
import { startOfMonth, endOfMonth } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectToDatabase();
    
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Mês e ano são obrigatórios' });
    }
    
    // Converter para números
    const monthNum = parseInt(month as string);
    const yearNum = parseInt(year as string);
    
    // Data de início e fim do mês
    const startDate = startOfMonth(new Date(yearNum, monthNum - 1));
    const endDate = endOfMonth(new Date(yearNum, monthNum - 1));
    
    // Buscar todos os trabalhadores ativos
    const workers = await Worker.find({ status: 'active' });
    
    // Array para armazenar os dados do relatório
    const timesheetRecords = [];
    
    // Para cada trabalhador, buscar registros de ponto do mês
    for (const worker of workers) {
      // Interface para definir a estrutura dos logs
      interface WorkerLog {
        date?: Date | string;
        entryTime?: string;
        leaveTime?: string;
        faltou?: boolean;
      }
      
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
            absent: log.faltou || (!log.entryTime && !log.leaveTime)
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
          absent: true
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
    
    return res.status(200).json(timesheetRecords);
  } catch (error) {
    console.error('Erro ao buscar relatório de controle de ponto:', error);
    return res.status(500).json({
      message: 'Erro ao gerar relatório de controle de ponto',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}