import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/api/mongodb';
import Budget from '@/models/Budget';
import { UserRole } from '@/types/permissions';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Conectar ao banco de dados
    await connectToDatabase();

    // Verificar autenticação
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Verificar permissões
    const userRole = session.user.role as UserRole;
    const allowedRoles = [UserRole.CEO, UserRole.ADMIN];
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Sem permissão para acessar este recurso' });
    }

    switch (req.method) {
      case 'GET':
        try {
          // Parâmetros de consulta
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
          return res.status(500).json({ 
            message: 'Erro ao buscar orçamentos',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }

      case 'POST':
        try {
          // Log de dados recebidos para debugging
          console.log('Dados de orçamento recebidos:', req.body);

          // Desestruturar dados da requisição
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

          // Validações detalhadas
          if (!title) {
            console.error('Erro: Título do orçamento é obrigatório');
            return res.status(400).json({ 
              message: 'Título do orçamento é obrigatório',
              field: 'title'
            });
          }

          if (!type) {
            console.error('Erro: Tipo de orçamento é obrigatório');
            return res.status(400).json({ 
              message: 'Tipo de orçamento é obrigatório',
              field: 'type'
            });
          }

          if (!year || year < 2000 || year > 2100) {
            console.error('Erro: Ano inválido');
            return res.status(400).json({ 
              message: 'Ano inválido',
              field: 'year'
            });
          }

          if (!items || items.length === 0) {
            console.error('Erro: Adicione pelo menos um item no orçamento');
            return res.status(400).json({ 
              message: 'Adicione pelo menos um item no orçamento',
              field: 'items'
            });
          }

          // Validar itens
          interface BudgetItem {
            description: string;
            category: string;
            estimatedValue: number;
          }
          
          items.forEach((item: BudgetItem, index: number) => {
            if (!item.description) {
              throw new Error(`Item ${index + 1}: Descrição é obrigatória`);
            }
            if (!item.category) {
              throw new Error(`Item ${index + 1}: Categoria é obrigatória`);
            }
            if (item.estimatedValue <= 0) {
              throw new Error(`Item ${index + 1}: Valor estimado deve ser positivo`);
            }
          });

          // Calcular valor total estimado
          const totalEstimatedValue = items.reduce((sum: number, item: BudgetItem) => sum + item.estimatedValue, 0);

          // Criar novo orçamento
          const newBudget = new Budget({
            title,
            type,
            year,
            department,
            totalEstimatedValue,
            items,
            createdBy: session.user.id,
            status: status || 'draft',
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            notes
          });

          try {
            // Salvar orçamento com validações
            await newBudget.save();
            return res.status(201).json(newBudget);
          } catch (saveError: unknown) {
            // Tratamento detalhado de erros de salvamento
            console.error('Erro ao salvar orçamento:', saveError);
            
            // Verifica erros de validação do Mongoose
            if (saveError instanceof Error && 'name' in saveError && saveError.name === 'ValidationError' && 'errors' in saveError) {
              const validationError = saveError as { errors: { [key: string]: { message: string } } };
              const errors = Object.values(validationError.errors).map(err => err.message);
              return res.status(400).json({ 
                message: 'Erro de validação',
                errors 
              });
            }

            // Outros tipos de erros
            return res.status(500).json({ 
              message: 'Erro interno ao salvar orçamento',
              error: saveError instanceof Error ? saveError.message : 'Erro desconhecido'
            });
          }
        } catch (error: unknown) {
          // Tratamento de erros gerais
          console.error('Erro completo:', error);
          return res.status(500).json({ 
            message: 'Erro interno ao criar orçamento',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            stack: error instanceof Error ? error.stack : undefined
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Método ${req.method} não permitido`);
    }
  } catch (error) {
    // Erro crítico de conexão ou autenticação
    console.error('Erro crítico na API de orçamentos:', error);
    return res.status(500).json({ 
      message: 'Erro crítico na API',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}