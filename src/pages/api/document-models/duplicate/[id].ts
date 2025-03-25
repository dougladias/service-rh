import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/api/mongodb';
import DocumentModel from '@/models/DocumentModel';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar autenticação
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  // Obter o ID do modelo
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID inválido' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Conectar ao banco de dados
    await connectToDatabase();

    // Buscar o modelo original
    const originalModel = await DocumentModel.findById(id);
    if (!originalModel) {
      return res.status(404).json({ message: 'Modelo não encontrado' });
    }

    // Duplicar o arquivo físico se existir
    let newFilePath = null;
    if (originalModel.filePath) {
      const originalFilePath = path.join(process.cwd(), 'public', originalModel.filePath);
      
      // Verificar se o arquivo existe
      if (fs.existsSync(originalFilePath)) {
        // Gerar um novo nome de arquivo
        const fileId = uuidv4();
        const extension = path.extname(originalFilePath);
        const newFileName = `${fileId}${extension}`;
        
        // Diretório para o novo arquivo
        const uploadDir = path.join(process.cwd(), 'public/uploads/document-models');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Caminho para o novo arquivo
        const newFilePathFull = path.join(uploadDir, newFileName);
        
        // Copiar o arquivo
        fs.copyFileSync(originalFilePath, newFilePathFull);
        
        // Caminho relativo para o banco de dados
        newFilePath = `/uploads/document-models/${newFileName}`;
      }
    }

    // Criar o novo modelo
    const newModel = new DocumentModel({
      name: `${originalModel.name} (Cópia)`,
      type: originalModel.type,
      description: originalModel.description,
      createdBy: session.user.name,
      format: originalModel.format,
      filePath: newFilePath
    });

    await newModel.save();

    return res.status(201).json(newModel);
  } catch (error) {
    console.error('Erro ao duplicar modelo de documento:', error);
    return res.status(500).json({ message: 'Erro ao duplicar modelo de documento' });
  }
}