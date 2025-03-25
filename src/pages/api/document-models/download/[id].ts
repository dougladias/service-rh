import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/api/mongodb';
import DocumentModel from '@/models/DocumentModel';
import fs from 'fs';
import path from 'path';

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

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Conectar ao banco de dados
    await connectToDatabase();

    // Buscar o modelo
    const documentModel = await DocumentModel.findById(id);
    if (!documentModel) {
      return res.status(404).json({ message: 'Modelo não encontrado' });
    }

    // Verificar se existe o filePath
    if (!documentModel.filePath) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    // Montar o caminho completo do arquivo
    const filePath = path.join(process.cwd(), 'public', documentModel.filePath);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado no sistema' });
    }

    // Configurar headers para download
    const fileBuffer = fs.readFileSync(filePath);
    const filename = documentModel.name;
    const extension = path.extname(filePath);
    
    // Definir o tipo MIME com base na extensão
    let contentType = 'application/octet-stream';
    switch (extension.toLowerCase()) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }

    // Configurar os headers da resposta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}${extension}`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Enviar o arquivo
    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error('Erro ao fazer download do modelo:', error);
    return res.status(500).json({ message: 'Erro ao fazer download do modelo' });
  }
}