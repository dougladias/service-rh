import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Visitors from '@/models/Visitors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectToDatabase();
    
    const { startDate, endDate } = req.query;
    
    const query: Record<string, unknown> = {};
    
    // Filtrar por período, se fornecido
    if (startDate && endDate) {
      query['logs.entryTime'] = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    // Buscar visitantes com logs no período especificado
    const visitors = await Visitors.find(query).sort({ 'logs.entryTime': -1 });
    
    return res.status(200).json(visitors);
  } catch (error) {
    console.error('Erro ao buscar relatório de visitantes:', error);
    return res.status(500).json({
      message: 'Erro ao gerar relatório de visitantes',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}