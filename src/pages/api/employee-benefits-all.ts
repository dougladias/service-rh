// src/pages/api/employee-benefits-all.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/api/mongoose';
import { EmployeeBenefit } from '@/models/Benefit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Conectar ao banco de dados
    await connectToDatabase;

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Buscar todos os benefícios com populate do tipo de benefício
    const allBenefits = await EmployeeBenefit.find({})
      .populate('benefitTypeId');

    // Transformar os resultados para incluir detalhes do tipo de benefício
    const benefitsWithType = allBenefits.map(benefit => {
      return {
        _id: benefit._id,
        employeeId: benefit.employeeId,
        benefitTypeId: benefit.benefitTypeId._id,
        value: benefit.value,
        status: benefit.status,
        benefitType: benefit.benefitTypeId
      };
    });

    res.status(200).json(benefitsWithType);
  } catch (error) {
    console.error('Erro ao buscar todos os benefícios:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar todos os benefícios',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}