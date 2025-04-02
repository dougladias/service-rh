import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Worker from '@/models/Worker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectToDatabase();
    
    const { department } = req.query;
    
    // Interface para a query do MongoDB
    interface WorkerQuery {
      department?: string | { $exists: boolean };
    }
    
    // Construir a query com base nos filtros
    const query: WorkerQuery = {};
    
    // Filtrar por departamento, se especificado
    if (department && department !== 'all') {
      if (department === 'noDepartment') {
        // Buscar funcionários sem departamento
        query.department = { $exists: false };
      } else {
        // Buscar funcionários do departamento específico
        // Garantir que estamos usando uma string, não um array
        const departmentValue = Array.isArray(department) ? department[0] : department;
        query.department = departmentValue;
      }
    }
    
    // Buscar funcionários com as condições aplicadas
    const workers = await Worker.find(query).sort({ name: 1 });
    
    return res.status(200).json(workers);
  } catch (error) {
    console.error('Erro ao buscar relatório de funcionários:', error);
    return res.status(500).json({
      message: 'Erro ao gerar relatório de funcionários',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}