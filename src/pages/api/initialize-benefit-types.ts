// src/pages/api/initialize-benefit-types.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '@/api/mongoose';
import { BenefitType, IBenefitType } from '@/models/Benefit';

// Tipos de benefícios padrão
const defaultBenefitTypes: Partial<IBenefitType>[] = [
  {
    name: 'Vale Transporte',
    description: 'Auxílio para deslocamento do funcionário',
    hasDiscount: true,
    discountPercentage: 6,
    defaultValue: 220.00
  },
  {
    name: 'Vale Refeição',
    description: 'Auxílio para alimentação',
    hasDiscount: false,
    defaultValue: 880.00
  },
  {
    name: 'Vale Alimentação',
    description: 'Auxílio para compras em supermercados',
    hasDiscount: false,
    defaultValue: 600.00
  },
  {
    name: 'Plano de Saúde',
    description: 'Assistência médica empresarial',
    hasDiscount: true,
    discountPercentage: 20,
    defaultValue: 350.00
  },
  {
    name: 'Auxílio Educação',
    description: 'Auxílio para cursos e qualificações',
    hasDiscount: false,
    defaultValue: 300.00
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar se é um método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Conectar ao banco de dados
    await connectToDatabase;

    // Verificar se já existem tipos de benefícios
    const existingTypes = await BenefitType.countDocuments();
    
    if (existingTypes > 0) {
      return res.status(400).json({ 
        message: 'Tipos de benefícios já foram inicializados',
        count: existingTypes
      });
    }

    // Criar tipos de benefícios padrão
    const createdTypes = await BenefitType.create(defaultBenefitTypes);

    res.status(201).json({
      message: 'Tipos de benefícios inicializados com sucesso',
      createdTypes
    });
  } catch (error) {
    console.error('Erro ao inicializar tipos de benefícios:', error);
    
    // Lidar com diferentes tipos de erros
    if (error instanceof Error) {
      res.status(500).json({ 
        message: 'Erro ao inicializar tipos de benefícios',
        error: error.message
      });
    } else {
      res.status(500).json({ 
        message: 'Erro desconhecido ao inicializar tipos de benefícios' 
      });
    }
  }
}