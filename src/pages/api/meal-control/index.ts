import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import MealControl from '@/models/MealControl';
import Worker from '@/models/Worker';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
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
          // Buscar todos os controles de marmita
          // Parâmetros de filtro opcionais
          const { employeeId, department, startDate, endDate } = req.query;
          
          // Construir o filtro
          const filter: Record<string, unknown> = {};
          
          if (employeeId) {
            filter.employeeId = employeeId;
          }
          
          if (department) {
            filter.department = department;
          }
          
          // Filtro de período para registros de marmitas
          if (startDate || endDate) {
            filter['mealRecords.date'] = {};
            
            if (startDate) {
              (filter['mealRecords.date'] as { $gte?: Date }).$gte = new Date(startDate as string);
            }
            
            if (endDate) {
              (filter['mealRecords.date'] as { $lte?: Date }).$lte = new Date(endDate as string);
            }
          }
          
          const mealControls = await MealControl.find(filter).sort({ employeeName: 1 });
          
          return res.status(200).json(mealControls);
        } catch (error) {
          console.error('Erro ao buscar controles de marmita:', error);
          return res.status(500).json({ message: 'Erro ao buscar controles de marmita' });
        }

      case 'POST':
        try {
          // Criar um novo controle de marmita
          const { 
            employeeId, 
            hasMealAllowance,
            mealPlanType,
            monthlyBudget,
            mealRecords 
          } = req.body;
          
          // Verificar se o funcionário existe
          const worker = await Worker.findById(employeeId);
          if (!worker) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
          }
          
          // Verificar se já existe um controle para este funcionário
          const existingControl = await MealControl.findOne({ employeeId });
          if (existingControl) {
            return res.status(409).json({ message: 'Controle de marmita já existe para este funcionário' });
          }
          
          // Criar novo controle de marmita
          const newMealControl = new MealControl({
            employeeId,
            employeeName: worker.name,
            department: worker.department || 'Não especificado',
            hasMealAllowance: hasMealAllowance || false,
            mealPlanType: mealPlanType || 'none',
            monthlyBudget: monthlyBudget || 0,
            mealRecords: mealRecords || []
          });
          
          await newMealControl.save();
          
          return res.status(201).json(newMealControl);
        } catch (error) {
          console.error('Erro ao criar controle de marmita:', error);
          return res.status(500).json({ message: 'Erro ao criar controle de marmita' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Método ${req.method} não permitido` });
    }
  } catch (error) {
    console.error('Erro na API de controle de marmitas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}