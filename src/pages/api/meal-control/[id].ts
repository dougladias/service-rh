import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import MealControl from '@/models/MealControl';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar autenticação
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Validar ID
    const { id } = req.query;
    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    // Conectar ao banco de dados
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        try {
          // Buscar um único controle de marmita
          const mealControl = await MealControl.findById(id);
          
          if (!mealControl) {
            return res.status(404).json({ message: 'Controle de marmita não encontrado' });
          }
          
          return res.status(200).json(mealControl);
        } catch (error) {
          console.error('Erro ao buscar controle de marmita:', error);
          return res.status(500).json({ message: 'Erro ao buscar controle de marmita' });
        }

      case 'PUT':
        try {
          // Atualizar um controle de marmita
          const { 
            hasMealAllowance,
            mealPlanType,
            monthlyBudget
          } = req.body;
          
          interface UpdateData {
            hasMealAllowance?: boolean;
            mealPlanType?: string;
            monthlyBudget?: number;
          }
          const updateData: UpdateData = {};
          
          if (typeof hasMealAllowance === 'boolean') {
            updateData.hasMealAllowance = hasMealAllowance;
          }
          
          if (mealPlanType) {
            updateData.mealPlanType = mealPlanType;
          }
          
          if (monthlyBudget !== undefined) {
            updateData.monthlyBudget = monthlyBudget;
          }
          
          const updatedMealControl = await MealControl.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
          );
          
          if (!updatedMealControl) {
            return res.status(404).json({ message: 'Controle de marmita não encontrado' });
          }
          
          return res.status(200).json(updatedMealControl);
        } catch (error) {
          console.error('Erro ao atualizar controle de marmita:', error);
          return res.status(500).json({ message: 'Erro ao atualizar controle de marmita' });
        }

      case 'DELETE':
        try {
          // Excluir um controle de marmita
          const deletedMealControl = await MealControl.findByIdAndDelete(id);
          
          if (!deletedMealControl) {
            return res.status(404).json({ message: 'Controle de marmita não encontrado' });
          }
          
          return res.status(200).json({ message: 'Controle de marmita excluído com sucesso' });
        } catch (error) {
          console.error('Erro ao excluir controle de marmita:', error);
          return res.status(500).json({ message: 'Erro ao excluir controle de marmita' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Método ${req.method} não permitido` });
    }
  } catch (error) {
    console.error('Erro na API de controle de marmitas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}