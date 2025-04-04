// src/pages/api/budgets/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/api/mongodb';
import Budget from '@/models/Budget';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  // Conectar ao banco de dados
  await connectToDatabase();

  switch (req.method) {
    case 'GET':
      try {
        const { 
          year, 
          type, 
          department, 
          status,
          page = 1,
          limit = 10 
        } = req.query;

        // Construir filtro
        const filter: Record<string, unknown> = {};
        if (year) filter.year = parseInt(year as string);
        if (type) filter.type = type;
        if (department) filter.department = department;
        if (status) filter.status = status;

        // Opções de paginação
        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);
        const skip = (pageNumber - 1) * limitNumber;

        // Buscar orçamentos com paginação
        const [budgets, total] = await Promise.all([
          Budget.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name'),
          Budget.countDocuments(filter)
        ]);

        return res.status(200).json({
          budgets,
          pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            totalItems: total
          }
        });
      } catch (error) {
        console.error('Erro ao buscar orçamentos:', error);
        return res.status(500).json({ message: 'Erro ao buscar orçamentos' });
      }

    case 'POST':
      try {
        // Obter dados do corpo da requisição
        const { 
          title, 
          type, 
          year, 
          department,
          items,
          startDate,
          endDate,
          notes
        } = req.body;

        // Calcular valor total estimado
        const totalEstimatedValue = items.reduce((sum: number, item: { estimatedValue: number }) => sum + item.estimatedValue, 0);

        // Criar novo orçamento
        const newBudget = new Budget({
          title,
          type,
          year,
          department,
          totalEstimatedValue,
          items,
          createdBy: session.user.id,
          status: 'draft',
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          notes
        });

        // Salvar orçamento
        await newBudget.save();

        return res.status(201).json(newBudget);
      } catch (error) {
        console.error('Erro ao criar orçamento:', error);
        return res.status(500).json({ message: 'Erro ao criar orçamento' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}