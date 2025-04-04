import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import MealControl, { IMealRecord } from '@/models/MealControl';
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
      case 'POST':
        try {
          // Adicionar um novo registro de marmita
          const { date, mealType, provided, cost, notes } = req.body;
          
          if (!date || !mealType) {
            return res.status(400).json({ message: 'Data e tipo de refeição são obrigatórios' });
          }
          
          // Validar tipo de refeição
          const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
          if (!validMealTypes.includes(mealType)) {
            return res.status(400).json({ message: 'Tipo de refeição inválido' });
          }
          
          // Buscar controle de marmita
          const mealControl = await MealControl.findById(id);
          if (!mealControl) {
            return res.status(404).json({ message: 'Controle de marmita não encontrado' });
          }
          
          // Criar novo registro
          const newRecord: IMealRecord = {
            date: new Date(date),
            mealType,
            provided: provided || false,
            cost: cost || 0,
            notes: notes
          };
          
          // Adicionar ao controle
          mealControl.mealRecords.push(newRecord);
          await mealControl.save();
          
          return res.status(201).json({
            message: 'Registro de marmita adicionado com sucesso',
            record: newRecord,
            mealControl
          });
        } catch (error) {
          console.error('Erro ao adicionar registro de marmita:', error);
          return res.status(500).json({ message: 'Erro ao adicionar registro de marmita' });
        }

      case 'PUT':
        try {
          // Atualizar um registro de marmita
          const { recordId, provided, cost, notes } = req.body;
          
          if (!recordId) {
            return res.status(400).json({ message: 'ID do registro é obrigatório' });
          }
          
          // Buscar controle de marmita
          const mealControl = await MealControl.findById(id);
          if (!mealControl) {
            return res.status(404).json({ message: 'Controle de marmita não encontrado' });
          }
          
          // Encontrar o registro específico
          const recordIndex: number = mealControl.mealRecords.findIndex(
            (record: IMealRecord) => record._id && record._id.toString() === recordId
          );
          
          if (recordIndex === -1) {
            return res.status(404).json({ message: 'Registro de marmita não encontrado' });
          }
          
          // Atualizar campos
          if (provided !== undefined) {
            mealControl.mealRecords[recordIndex].provided = provided;
          }
          
          if (cost !== undefined) {
            mealControl.mealRecords[recordIndex].cost = cost;
          }
          
          if (notes !== undefined) {
            mealControl.mealRecords[recordIndex].notes = notes;
          }
          
          await mealControl.save();
          
          return res.status(200).json({
            message: 'Registro de marmita atualizado com sucesso',
            record: mealControl.mealRecords[recordIndex],
            mealControl
          });
        } catch (error) {
          console.error('Erro ao atualizar registro de marmita:', error);
          return res.status(500).json({ message: 'Erro ao atualizar registro de marmita' });
        }

      case 'DELETE':
        try {
          // Remover um registro de marmita
          const { recordId } = req.body;
          
          if (!recordId) {
            return res.status(400).json({ message: 'ID do registro é obrigatório' });
          }
          
          // Buscar controle de marmita
          const mealControl = await MealControl.findById(id);
          if (!mealControl) {
            return res.status(404).json({ message: 'Controle de marmita não encontrado' });
          }
          
          // Remover o registro específico
          const initialLength = mealControl.mealRecords.length;
          mealControl.mealRecords = mealControl.mealRecords.filter(
            (record: IMealRecord) => !record._id || record._id.toString() !== recordId
          );
          
          if (mealControl.mealRecords.length === initialLength) {
            return res.status(404).json({ message: 'Registro de marmita não encontrado' });
          }
          
          await mealControl.save();
          
          return res.status(200).json({
            message: 'Registro de marmita removido com sucesso',
            mealControl
          });
        } catch (error) {
          console.error('Erro ao remover registro de marmita:', error);
          return res.status(500).json({ message: 'Erro ao remover registro de marmita' });
        }

      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Método ${req.method} não permitido` });
    }
  } catch (error) {
    console.error('Erro na API de registro de marmitas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}