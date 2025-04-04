import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Invoice from '@/models/Invoice';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await connectToDatabase();

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID inválido' });
    }

    // Buscar a nota fiscal
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Nota fiscal não encontrada' });
    }

    // Verificar se o arquivo existe
    if (!invoice.filePath) {
      return res.status(404).json({ message: 'Arquivo da nota fiscal não encontrado' });
    }

    const filePath = path.join(process.cwd(), 'public', invoice.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo físico não encontrado' });
    }

    // Determinar tipo MIME
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.xml': 'application/xml',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    const fileExtension = path.extname(invoice.filePath).toLowerCase();
    const contentType = mimeTypes[fileExtension] || 'application/octet-stream';

    // Ler arquivo
    const fileBuffer = fs.readFileSync(filePath);

    // Configurar headers para download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(path.basename(invoice.filePath))}`);
    
    // Enviar arquivo
    res.send(fileBuffer);

  } catch (error) {
    console.error('Erro ao processar download da nota fiscal:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar download da nota fiscal',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}