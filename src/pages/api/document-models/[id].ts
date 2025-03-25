import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/api/mongodb';
import DocumentModel from '@/models/DocumentModel';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar autenticação
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  // Conectar ao banco de dados
  await connectToDatabase();

  // Obter o ID do modelo
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID inválido' });
  }

  switch (req.method) {
    case 'GET':
      try {
        // Buscar um modelo específico
        const documentModel = await DocumentModel.findById(id);
        if (!documentModel) {
          return res.status(404).json({ message: 'Modelo não encontrado' });
        }
        return res.status(200).json(documentModel);
      } catch (error) {
        console.error('Erro ao buscar modelo de documento:', error);
        return res.status(500).json({ message: 'Erro ao buscar modelo de documento' });
      }

    case 'PUT':
      try {
        // Atualizar um modelo
        const { name, description, type } = req.body;
        
        const documentModel = await DocumentModel.findById(id);
        if (!documentModel) {
          return res.status(404).json({ message: 'Modelo não encontrado' });
        }
        
        // Atualizar os campos
        documentModel.name = name || documentModel.name;
        documentModel.description = description || documentModel.description;
        documentModel.type = type || documentModel.type;
        documentModel.updatedAt = new Date();
        
        await documentModel.save();
        
        return res.status(200).json(documentModel);
      } catch (error) {
        console.error('Erro ao atualizar modelo de documento:', error);
        return res.status(500).json({ message: 'Erro ao atualizar modelo de documento' });
      }

    case 'DELETE':
      try {
        // Excluir um modelo (exclusão lógica)
        const documentModel = await DocumentModel.findById(id);
        if (!documentModel) {
          return res.status(404).json({ message: 'Modelo não encontrado' });
        }
        
        // Exclusão lógica (manter registro no banco, apenas marcar como inativo)
        documentModel.isActive = false;
        await documentModel.save();
        
        return res.status(200).json({ message: 'Modelo excluído com sucesso' });
      } catch (error) {
        console.error('Erro ao excluir modelo de documento:', error);
        return res.status(500).json({ message: 'Erro ao excluir modelo de documento' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}