// Em src/pages/api/departments.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Worker from '@/models/Worker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    
    // Agrupa e conta funcionários por departamento
    const departments = await Worker.aggregate([
      { $match: { status: "active" } },
      { 
        $group: { 
          _id: { 
            $cond: { 
              if: { $eq: ["$department", null] }, 
              then: "Sem Departamento", 
              else: "$department" 
            } 
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } },
      { 
        $project: { 
          department: "$_id", 
          count: 1, 
          _id: 0 
        } 
      }
    ]);
    
    // Formatar para o formato esperado pelo frontend
    const formattedDepartments = departments.map(dept => ({
      value: dept.department === "Sem Departamento" ? "noDepartment" : dept.department,
      label: `${dept.department} (${dept.count})`
    }));
    
    // Adicionar opção para todos os departamentos
    formattedDepartments.unshift({ value: 'all', label: 'Todos os departamentos' });
    
    res.status(200).json(formattedDepartments);
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar departamentos' });
  }
}