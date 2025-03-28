// Em /pages/api/documents/view/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Document from '../../../../../models/DocumentModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      
      console.log('Requisição para visualizar documento ID:', id);
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID inválido' });
      }
  
      // Conectar ao banco de dados
      await mongoose.connect(process.env.MONGODB_URI as string);
      
      // Buscar o documento
      const document = await Document.findById(id);
      console.log('Documento encontrado no DB:', document ? 'Sim' : 'Não');
      
      if (!document) {
        return res.status(404).json({ message: 'Documento não encontrado no banco de dados' });
      }
      
      // Verificar o caminho do arquivo
      const storedPath = document.path;
      console.log('Caminho armazenado no DB:', storedPath);
      
      // Construir o caminho absoluto do arquivo
      const filePath = path.join(process.cwd(), 'public', storedPath);
      console.log('Caminho absoluto do arquivo:', filePath);
      
      // Verificar se o arquivo existe
      const fileExists = fs.existsSync(filePath);
      console.log('Arquivo existe no sistema:', fileExists);
      
      if (!fileExists) {
        return res.status(404).json({ message: 'Arquivo físico não encontrado no servidor' });
      }
      
      // Obter tipo MIME
      const fileType = document.fileType || path.extname(document.name).substring(1);
      const mimeType = getMimeType(fileType);
      console.log('Tipo MIME:', mimeType);
      
      // Ler o arquivo
      const fileBuffer = fs.readFileSync(filePath);
      
      // Configurar headers e enviar arquivo
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(document.name)}`);
      
      res.send(fileBuffer);
    } catch (error) {
      console.error('Erro ao servir documento:', error);
      res.status(500).json({ 
        message: 'Erro ao processar documento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
  
  // Função auxiliar para determinar o tipo MIME
  function getMimeType(fileType: string): string {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'txt': 'text/plain'
    };
    
    return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
  }