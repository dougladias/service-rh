// src/pages/api/benefit-types.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';
import { BenefitType, IBenefitType } from '@/models/Benefit';
import connectToDatabase from '@/api/mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Conectar ao banco de dados
  try {
    await connectToDatabase;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return res.status(500).json({ message: 'Erro ao conectar ao banco de dados' });
  }

  switch (req.method) {
    case 'GET':
      try {
        // Buscar todos os tipos de benefícios ativos
        const benefitTypes = await BenefitType.find({ status: 'active' });
        res.status(200).json(benefitTypes);
      } catch (error) {
        console.error('Erro ao buscar tipos de benefícios:', error);
        res.status(500).json({ message: 'Erro ao buscar tipos de benefícios' });
      }
      break;

    case 'POST':
      try {
        // Verificar se o usuário tem permissão (você pode adicionar middleware de autenticação aqui)
        const { 
          name, 
          description, 
          hasDiscount, 
          discountPercentage, 
          defaultValue 
        } = req.body;

        // Validar campos obrigatórios
        if (!name || !description || defaultValue === undefined) {
          return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
        }

        // Criar novo tipo de benefício
        const newBenefitType = new BenefitType({
          name,
          description,
          hasDiscount: hasDiscount || false,
          discountPercentage: hasDiscount ? discountPercentage : undefined,
          defaultValue,
          status: 'active'
        });

        await newBenefitType.save();
        res.status(201).json(newBenefitType);
      } catch (error) {
        console.error('Erro ao criar tipo de benefício:', error);
        
        // Lidar com erro de duplicidade
        if (error instanceof mongoose.Error.ValidationError) {
          return res.status(400).json({ message: 'Erro de validação', details: error.errors });
        }
        // Verificar erro de chave duplicada (nome único)
        if (error instanceof MongoServerError && error.code === 11000) {
          return res.status(409).json({ message: 'Um benefício com este nome já existe' });
        }
        
        res.status(500).json({ message: 'Erro ao criar tipo de benefício' });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const updateData: Partial<IBenefitType> = req.body;

        // Validar ID
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ message: 'ID inválido' });
        }

        // Encontrar e atualizar o tipo de benefício
        const updatedBenefitType = await BenefitType.findByIdAndUpdate(
          id, 
          updateData, 
          { 
            new: true,  // Retorna o documento atualizado
            runValidators: true  // Executa validações no update
          }
        );

        if (!updatedBenefitType) {
          return res.status(404).json({ message: 'Tipo de benefício não encontrado' });
        }

        res.status(200).json(updatedBenefitType);
      } catch (error) {
        console.error('Erro ao atualizar tipo de benefício:', error);
        res.status(500).json({ message: 'Erro ao atualizar tipo de benefício' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        // Validar ID
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ message: 'ID inválido' });
        }

        // Desativar o tipo de benefício em vez de excluir
        const deletedBenefitType = await BenefitType.findByIdAndUpdate(
          id, 
          { status: 'inactive' }, 
          { new: true }
        );

        if (!deletedBenefitType) {
          return res.status(404).json({ message: 'Tipo de benefício não encontrado' });
        }

        res.status(200).json({ 
          message: 'Tipo de benefício desativado com sucesso',
          benefitType: deletedBenefitType 
        });
      } catch (error) {
        console.error('Erro ao excluir tipo de benefício:', error);
        res.status(500).json({ message: 'Erro ao excluir tipo de benefício' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}