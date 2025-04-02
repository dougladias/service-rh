import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Prestadores from '@/models/Prestadores';
import { exportToPdf } from '@/utils/pdf-export';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectToDatabase();
    
    const { startDate, endDate, format: outputFormat = 'pdf' } = req.query;
    
    // Validar datas
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Período (startDate e endDate) é obrigatório' });
    }
    
    // Parse das datas
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    // Validar datas parseadas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Formato de data inválido' });
    }
    
    // Define a proper type for MongoDB query
    interface MongoDbQuery {
      [key: string]: {
        $gte: Date;
        $lte: Date;
      };
    }
    
    const query: MongoDbQuery = {
      'logs.entryTime': {
        $gte: start,
        $lte: end
      }
    };
    
    // Buscar prestadores com logs no período especificado
    const prestadores = await Prestadores.find(query).sort({ name: 1 });
    
    // Processar os dados para o relatório
    const reportData = prestadores.map(prestador => {
      // Pegar o último log, ou o que estiver dentro do período especificado
      const prestadorLogs = prestador.logs || [];
      
      // Define log type
      interface PrestadorLog {
        entryTime: Date | string;
        leaveTime?: Date | string;
      }
      
      // Filtrar logs dentro do período especificado
      const logsInPeriod = prestadorLogs.filter((log: PrestadorLog) => {
        const entryTime = new Date(log.entryTime);
        return entryTime >= start && entryTime <= end;
      });
      
      // Para cada log, criar uma entrada no relatório
      return logsInPeriod.map((log: PrestadorLog) => ({
        id: prestador._id,
        name: prestador.name,
        company: prestador.company,
        service: prestador.service,
        document: prestador.cnpj || prestador.cpf,
        phone: prestador.phone,
        visitDate: new Date(log.entryTime),
        entryTime: log.entryTime,
        leaveTime: log.leaveTime,
        duration: log.leaveTime ? 
          Math.round(((new Date(log.leaveTime).getTime() - new Date(log.entryTime).getTime()) / (1000 * 60))) : null
      }));
    }).flat(); // Achatar o array de arrays
    
    // Ordenar por data e nome
    reportData.sort((a, b) => {
      // Primeiro por data
      const dateCompare = a.visitDate.getTime() - b.visitDate.getTime();
      if (dateCompare !== 0) return dateCompare;
      
      // Depois por nome
      return a.name.localeCompare(b.name);
    });
    
    // Verificar o formato de saída
    if (outputFormat === 'pdf') {
      // Formatação das datas para subtítulo
      const formattedStartDate = format(start, 'dd/MM/yyyy', { locale: ptBR });
      const formattedEndDate = format(end, 'dd/MM/yyyy', { locale: ptBR });
      
      // Configurar colunas do relatório
      const columns = [
        { key: 'name', header: 'Nome' },
        { key: 'company', header: 'Empresa' },
        { key: 'service', header: 'Serviço' },
        { key: 'document', header: 'Documento' },
        { key: 'phone', header: 'Telefone' },
        { 
          key: 'visitDate', 
          header: 'Data da Visita',
          format: (value: Date) => format(value, 'dd/MM/yyyy')
        },
        { 
          key: 'entryTime', 
          header: 'Entrada',
          format: (value: Date) => format(new Date(value), 'HH:mm')
        },
        { 
          key: 'leaveTime', 
          header: 'Saída',
          format: (value: Date | null) => value ? format(new Date(value), 'HH:mm') : '-'
        },
        { 
          key: 'duration', 
          header: 'Duração (min)',
          format: (value: number | null) => value ? value.toString() : '-'
        }
      ];
      
      // Exportar para PDF
      const pdfBuffer = await exportToPdf({
        title: 'Relatório de Prestadores de Serviço',
        subtitle: `Período: ${formattedStartDate} até ${formattedEndDate}`,
        filename: 'relatorio_prestadores.pdf',
        data: reportData,
        columns
      });
      
      // Configurar cabeçalhos da resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio_prestadores.pdf');
      
      // Enviar o PDF
      return res.send(pdfBuffer);
    } else {
      // Formato não suportado
      return res.status(400).json({ message: 'Formato de saída não suportado' });
    }
  } catch (error) {
    console.error('Erro ao exportar relatório de prestadores:', error);
    return res.status(500).json({
      message: 'Erro ao exportar relatório de prestadores',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}