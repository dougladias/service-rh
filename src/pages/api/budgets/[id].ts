
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/api/mongodb';
import Budget, { IBudget } from '@/models/Budget';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  // Conectar ao banco de dados
  await connectToDatabase();

  // Extrair ID do orçamento
  const { id } = req.query;

  // Validar ID
  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de orçamento inválido' });
  }

  switch (req.method) {
    case 'GET':
      try {
        // Buscar orçamento específico
        const budget = await Budget.findById(id)
          .populate('createdBy', 'name')
          .populate('approvedBy', 'name');

        if (!budget) {
          return res.status(404).json({ message: 'Orçamento não encontrado' });
        }

        return res.status(200).json(budget);
      } catch (error) {
        console.error('Erro ao buscar orçamento:', error);
        return res.status(500).json({ message: 'Erro ao buscar orçamento' });
      }

    case 'PUT':
      try {
        // Dados para atualização
        const { 
          title, 
          type, 
          year, 
          department,
          items,
          status,
          startDate,
          endDate,
          notes
        } = req.body;

        // Definir interface para os itens do orçamento
        interface BudgetItem {
          estimatedValue: number;
          [key: string]: unknown | number; // Para outras propriedades que possam existir
        }

        // Calcular valor total estimado
        const totalEstimatedValue = items.reduce((sum: number, item: BudgetItem) => sum + item.estimatedValue, 0);

        // Preparar dados de atualização
        const updateData: Partial<IBudget> = {
          title,
          type,
          year,
          department,
          totalEstimatedValue,
          items,
          status,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          notes
        };

        // Se for aprovação, adicionar quem aprovou
        if (status === 'approved' && session.user.id) {
          updateData.approvedBy = new mongoose.Types.ObjectId(session.user.id);
        }

        // Atualizar orçamento
        const updatedBudget = await Budget.findByIdAndUpdate(
          id, 
          updateData, 
          { 
            new: true,
            runValidators: true 
          }
        );

        if (!updatedBudget) {
          return res.status(404).json({ message: 'Orçamento não encontrado' });
        }

        return res.status(200).json(updatedBudget);
      } catch (error) {
        console.error('Erro ao atualizar orçamento:', error);
        return res.status(500).json({ message: 'Erro ao atualizar orçamento' });
      }

    case 'DELETE':
      try {
        // Excluir orçamento
        const deletedBudget = await Budget.findByIdAndDelete(id);

        if (!deletedBudget) {
          return res.status(404).json({ message: 'Orçamento não encontrado' });
        }

        return res.status(200).json({ message: 'Orçamento excluído com sucesso' });
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        return res.status(500).json({ message: 'Erro ao excluir orçamento' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}