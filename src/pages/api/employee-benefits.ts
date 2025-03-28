// src/pages/api/employee-benefits.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import connectToDatabase from '@/api/mongoose';
import Worker from '@/models/Worker';
import { BenefitType, EmployeeBenefit } from '@/models/Benefit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Conectar ao banco de dados
    await connectToDatabase;

    switch (req.method) {
      case 'GET':
        try {
          const { employeeId } = req.query;

          // Validar ID do funcionário
          if (!employeeId || typeof employeeId !== 'string') {
            return res.status(400).json({ message: 'ID do funcionário inválido' });
          }

          // Buscar benefícios do funcionário com populate de detalhes do tipo de benefício
          const employeeBenefits = await EmployeeBenefit.find({ 
            employeeId: new mongoose.Types.ObjectId(employeeId)
          }).populate('benefitTypeId');

          // Transformar os resultados para incluir detalhes do tipo de benefício
          const benefitsWithType = employeeBenefits.map(benefit => {
            return {
              _id: benefit._id,
              employeeId: benefit.employeeId,
              benefitTypeId: benefit.benefitTypeId._id,
              value: benefit.value,
              status: benefit.status,
              benefitType: benefit.benefitTypeId
            };
          });

          res.status(200).json(benefitsWithType);
        } catch (error) {
          console.error('Erro ao buscar benefícios do funcionário:', error);
          res.status(500).json({ 
            message: 'Erro ao buscar benefícios do funcionário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
        break;

      case 'POST':
        try {
          const { 
            employeeId, 
            benefitTypeId, 
            value, 
            status = 'active'
          } = req.body;

          // Validações
          if (!employeeId || !benefitTypeId) {
            return res.status(400).json({ 
              message: 'IDs de funcionário e tipo de benefício são obrigatórios',
              details: { employeeId, benefitTypeId }
            });
          }

          // Verificar se o funcionário existe
          const worker = await Worker.findById(employeeId);
          if (!worker) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
          }

          // Verificar se o tipo de benefício existe
          const benefitType = await BenefitType.findById(benefitTypeId);
          if (!benefitType) {
            return res.status(404).json({ message: 'Tipo de benefício não encontrado' });
          }

          // Usar valor padrão se não for fornecido
          const benefitValue = value || benefitType.defaultValue;

          // Criar novo benefício do funcionário
          const newEmployeeBenefit = new EmployeeBenefit({
            employeeId,
            benefitTypeId,
            value: benefitValue,
            status,
            startDate: new Date()
          });

          // Salvar no banco de dados
          await newEmployeeBenefit.save();

          // Popular detalhes do tipo de benefício para resposta
          await newEmployeeBenefit.populate('benefitTypeId');

          const responseData = {
            _id: newEmployeeBenefit._id,
            employeeId: newEmployeeBenefit.employeeId,
            benefitTypeId: newEmployeeBenefit.benefitTypeId._id,
            value: newEmployeeBenefit.value,
            status: newEmployeeBenefit.status,
            benefitType: newEmployeeBenefit.benefitTypeId
          };

          res.status(201).json(responseData);
        } catch (error) {
          console.error('Erro ao adicionar benefício do funcionário:', error);
          res.status(500).json({ 
            message: 'Erro ao adicionar benefício do funcionário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
        break;

      case 'PUT':
        try {
          const { id } = req.query;
          const updateData = req.body;

          // Validar ID
          if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'ID inválido' });
          }

          // Atualizar benefício do funcionário
          const updatedEmployeeBenefit = await EmployeeBenefit.findByIdAndUpdate(
            id, 
            updateData, 
            { 
              new: true,
              runValidators: true 
            }
          ).populate('benefitTypeId');

          if (!updatedEmployeeBenefit) {
            return res.status(404).json({ message: 'Benefício do funcionário não encontrado' });
          }

          const responseData = {
            _id: updatedEmployeeBenefit._id,
            employeeId: updatedEmployeeBenefit.employeeId,
            benefitTypeId: updatedEmployeeBenefit.benefitTypeId._id,
            value: updatedEmployeeBenefit.value,
            status: updatedEmployeeBenefit.status,
            benefitType: updatedEmployeeBenefit.benefitTypeId
          };

          res.status(200).json(responseData);
        } catch (error) {
          console.error('Erro ao atualizar benefício do funcionário:', error);
          res.status(500).json({ 
            message: 'Erro ao atualizar benefício do funcionário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
        break;

      case 'DELETE':
        try {
          const { id } = req.query;

          // Validar ID
          if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'ID inválido' });
          }

          // Excluir permanentemente o benefício
          const deletedEmployeeBenefit = await EmployeeBenefit.findByIdAndDelete(id);

          if (!deletedEmployeeBenefit) {
            return res.status(404).json({ message: 'Benefício do funcionário não encontrado' });
          }

          res.status(200).json({ 
            message: 'Benefício do funcionário excluído com sucesso',
          });
        } catch (error) {
          console.error('Erro ao excluir benefício do funcionário:', error);
          res.status(500).json({ 
            message: 'Erro ao excluir benefício do funcionário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Método ${req.method} não permitido`);
    }
  } catch (error) {
    console.error('Erro crítico na API de benefícios do funcionário:', error);
    res.status(500).json({ 
      message: 'Erro crítico na API',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}