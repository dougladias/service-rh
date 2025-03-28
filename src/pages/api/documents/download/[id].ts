// src/pages/api/documents/download/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Reutilize o mesmo schema do documento
const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  employee: { type: String, required: true },
  department: { type: String },
  uploadDate: { type: Date, default: Date.now },
  expiryDate: { type: String },
  size: { type: Number },
  fileType: { type: String },
  path: { type: String, required: true },
  tags: [String]
});

// Verifica se o modelo já existe para evitar redefini-lo
const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID do documento não fornecido' });
    }

    console.log('Buscando documento com ID:', id);
    
    // Buscar o documento no banco de dados
    const document = await Document.findById(id);
    
    if (!document) {
      console.log('Documento não encontrado no banco:', id);
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    console.log('Documento encontrado:', {
      name: document.name,
      path: document.path,
      fileType: document.fileType
    });
    
    // Construir o caminho completo do arquivo
    const filePath = path.join(process.cwd(), 'public', document.path);
    console.log('Caminho construído:', filePath);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.log('Arquivo não encontrado no sistema:', filePath);
      return res.status(404).json({ message: 'Arquivo físico não encontrado' });
    }

    console.log('Arquivo encontrado, servindo conteúdo');
    
    // Determinar o tipo MIME
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    };
    
    const fileType = document.fileType.toLowerCase();
    const contentType = mimeTypes[fileType] || 'application/octet-stream';
    
    // Ler e enviar o arquivo
    const fileData = fs.readFileSync(filePath);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(document.name)}`);
    
    // Enviar o arquivo como resposta
    res.send(fileData);
    
  } catch (error) {
    console.error('Erro ao processar download do documento:', error);
    res.status(500).json({ 
      message: 'Erro ao processar download do documento', 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}