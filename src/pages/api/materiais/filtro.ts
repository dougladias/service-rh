// pages/api/materiais/filtro.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import { Material, MaterialDocument, toAppMaterial } from '@/interfaces/material';

type ResponseData = {
  error?: string;
  message?: string;
} | Material[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  
  const { month, year, category } = req.query;
  
  try {
    const db = await connectToDatabase();
    
    // Construir o filtro baseado nos parâmetros da URL
    const filter: Record<string, unknown> = {};
    
    // Filtro por mês e ano
    if (month && year) {
      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);
      
      if (!isNaN(monthNum) && !isNaN(yearNum)) {
        // Calcular o primeiro e último dia do mês
        const startDate = new Date(yearNum, monthNum - 1, 1).toISOString();
        const endDate = new Date(yearNum, monthNum, 0).toISOString();
        
        filter.dataCriacao = {
          $gte: startDate,
          $lte: endDate
        };
      }
    }
    
    // Filtro por categoria
    if (category && category !== 'Todos') {
      filter.categoria = category;
    }
    
    // Buscar materiais com os filtros
    const materiaisDoc = await db.collection('materiais').find(filter).toArray();
    
    // Mapear documentos do MongoDB para formato da aplicação
    const materiais = materiaisDoc.map(doc => toAppMaterial(doc as MaterialDocument));
    
    res.status(200).json(materiais);
  } catch (error) {
    console.error('Erro ao filtrar materiais:', error);
    res.status(500).json({ error: 'Falha ao filtrar materiais' });
  }
}