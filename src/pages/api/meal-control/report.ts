import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import MealControl from '@/models/MealControl';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

interface ReportData {
  totalEmployees: number;
  totalMealsProvided: number;
  totalCost: number;
  mealsByType: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  mealsByDepartment: {
    [department: string]: {
      count: number;
      cost: number;
    };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar autenticação
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Conectar ao banco de dados
    await connectToDatabase();

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: `Método ${req.method} não permitido` });
    }

    // Parâmetros para o relatório
    const { month, year, department } = req.query;

    // Validar mês e ano
    const reportMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
    const reportYear = year ? parseInt(year as string) : new Date().getFullYear();

    // Validar mês e ano
    if (isNaN(reportMonth) || reportMonth < 1 || reportMonth > 12) {
      return res.status(400).json({ message: 'Mês inválido' });
    }

    if (isNaN(reportYear) || reportYear < 2000 || reportYear > 2100) {
      return res.status(400).json({ message: 'Ano inválido' });
    }

    // Definir período do relatório
    const startDate = startOfMonth(new Date(reportYear, reportMonth - 1));
    const endDate = endOfMonth(new Date(reportYear, reportMonth - 1));

    // Construir filtro
    const filter: { department?: string } = {};

    // Filtrar por departamento, se especificado
    if (department && department !== 'all') {
      filter.department = typeof department === 'string' ? department : undefined;
    }

    // Buscar registros para o relatório
    const mealControls = await MealControl.find(filter);

    // Inicializar dados do relatório
    const reportData: ReportData = {
      totalEmployees: mealControls.length,
      totalMealsProvided: 0,
      totalCost: 0,
      mealsByType: {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0
      },
      mealsByDepartment: {}
    };

    // Processar dados para o relatório
    mealControls.forEach(control => {
      const departmentName = control.department || 'Não especificado';

      // Inicializar o departamento se necessário
      if (!reportData.mealsByDepartment[departmentName]) {
        reportData.mealsByDepartment[departmentName] = {
          count: 0,
          cost: 0
        };
      }

      // Filtrar registros no período especificado
    const periodRecords = control.mealRecords.filter((record: { date: string; provided: boolean; mealType: keyof ReportData['mealsByType']; cost?: number }) => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate && record.provided;
    });

      // Contabilizar refeições
    periodRecords.forEach((record: {
      date: string;
      provided: boolean;
      mealType: keyof ReportData['mealsByType'];
      cost?: number;
    }) => {
      reportData.totalMealsProvided++;
      reportData.totalCost += record.cost || 0;
      reportData.mealsByDepartment[departmentName].count++;
      reportData.mealsByDepartment[departmentName].cost += record.cost || 0;

      // Contabilizar por tipo de refeição
      reportData.mealsByType[record.mealType]++;
    });
    });

    // Retornar relatório gerado
    return res.status(200).json({
      period: {
        month: reportMonth,
        year: reportYear,
        startDate,
        endDate
      },
      filter: {
        department: department || 'all'
      },
      data: reportData
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de marmitas:', error);
    return res.status(500).json({ message: 'Erro ao gerar relatório de marmitas' });
  }
}