import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/api/mongodb';
import DocumentModel from '@/models/DocumentModel';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false, // Desabilita o bodyParser para poder processar o upload de arquivos
  },
};

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

  switch (req.method) {
    case 'GET':
      try {
        // Pegar todos os modelos de documentos
        const documentModels = await DocumentModel.find({ isActive: true }).sort({ updatedAt: -1 });
        return res.status(200).json(documentModels);
      } catch (error) {
        console.error('Erro ao buscar modelos de documentos:', error);
        return res.status(500).json({ message: 'Erro ao buscar modelos de documentos' });
      }

    case 'POST':
      try {
        // Processar o upload de arquivo
        const form = new IncomingForm({
          uploadDir: path.join(process.cwd(), 'public/uploads/document-models'),
          keepExtensions: true,
          maxFileSize: 5 * 1024 * 1024, // 5MB
        });

        // Certifique-se de que o diretório existe
        const uploadDir = path.join(process.cwd(), 'public/uploads/document-models');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        return new Promise((resolve) => {
          form.parse(req, async (err, fields, files) => {
            if (err) {
              console.error('Erro ao processar o upload:', err);
              res.status(500).json({ message: 'Erro ao processar o upload' });
              return resolve(true);
            }

            // Obter informações do arquivo
            const fileArray = Array.isArray(files.file) ? files.file : [files.file];
            const file = fileArray[0];
            
            // Obter informações dos campos
            const name = Array.isArray(fields.name) ? fields.name[0] : fields.name || '';
            const type = Array.isArray(fields.type) ? fields.type[0] : fields.type || '';
            const description = Array.isArray(fields.description) ? fields.description[0] : fields.description || '';

            if (!file) {
              res.status(400).json({ message: 'Nenhum arquivo foi enviado' });
              return resolve(true);
            }

            // Gerar um nome único para o arquivo
            const fileId = uuidv4();
            const fileExtension = path.extname(file.originalFilename || '');
            const newFilename = `${fileId}${fileExtension}`;
            const newFilePath = path.join(uploadDir, newFilename);

            // Mover o arquivo para o local definitivo
            fs.renameSync(file.filepath, newFilePath);

            // Criar o modelo de documento
            const newDocumentModel = new DocumentModel({
              name,
              type,
              description,
              createdBy: session.user.name,
              format: fileExtension.substring(1).toLowerCase(),
              filePath: `/uploads/document-models/${newFilename}`
            });

            await newDocumentModel.save();

            res.status(201).json(newDocumentModel);
            return resolve(true);
          });
        });
      } catch (error) {
        console.error('Erro ao criar modelo de documento:', error);
        return res.status(500).json({ message: 'Erro ao criar modelo de documento' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}