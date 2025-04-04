import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase, mongoose } from '@/api/mongodb';
import Budget, { IBudget } from '@/models/Budget';

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
        // Buscar orçamento específico com tratamento para populate
        const query = Budget.findById(id);
        
        // Tentar fazer populate de forma segura
        try {
          if (mongoose.models.Worker) {
            query.populate('createdBy', 'name')
                 .populate('approvedBy', 'name');
          }
        } catch (populateError) {
          console.warn('Aviso: Não foi possível popular os campos createdBy/approvedBy', populateError);
        }
        
        const budget = await query;

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
          [key: string]: unknown | number;
        }

        // Calcular valor total estimado
        const totalEstimatedValue = items.reduce((sum: number, item: BudgetItem) => sum + item.estimatedValue, 0);

        // CORREÇÃO: Primeiro buscar o orçamento existente para não perder o createdBy
        const existingBudget = await Budget.findById(id);
        if (!existingBudget) {
          return res.status(404).json({ message: 'Orçamento não encontrado' });
        }

        // Preservar o createdBy original para não causar erro de validação
        const createdBy = existingBudget.createdBy;

        // Preparar dados de atualização
        const updateData: Partial<IBudget> = {
          title,
          type,
          year,
          department,
          totalEstimatedValue,
          items,
          status,
          createdBy, // Usar o ObjectId original já validado
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          notes
        };

        // Se for aprovação, adicionar quem aprovou
        if (status === 'approved' && session.user.id) {
          try {
            updateData.approvedBy = new mongoose.Types.ObjectId(session.user.id);
          } catch (idError) {
            console.warn('Aviso: ID de usuário inválido para aprovação, usando ID padrão', idError);
            updateData.approvedBy = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
          }
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
        return res.status(500).json({ 
          message: 'Erro ao atualizar orçamento',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
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