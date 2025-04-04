import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Invoice from '@/models/Invoice';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    // Extrair o ID da nota fiscal da URL
    const { id } = req.query;

    // Verificar se o ID é válido
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID inválido' });
    }

    switch (req.method) {
      case 'DELETE':
        try {
          // Encontrar a nota fiscal para remover o arquivo físico
          const invoice = await Invoice.findById(id);

          if (!invoice) {
            return res.status(404).json({ message: 'Nota fiscal não encontrada' });
          }

          // Remover arquivo físico, se existir
          if (invoice.filePath) {
            const fullPath = path.join(process.cwd(), 'public', invoice.filePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }

          // Remover do banco de dados
          await Invoice.findByIdAndDelete(id);

          return res.status(200).json({ message: 'Nota fiscal excluída com sucesso' });
        } catch (error) {
          console.error('Erro ao excluir nota fiscal:', error);
          return res.status(500).json({ 
            message: 'Erro ao excluir nota fiscal',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }

      default:
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Método ${req.method} não permitido`);
    }
  } catch (error) {
    console.error('Erro crítico na API de notas fiscais:', error);
    return res.status(500).json({ 
      message: 'Erro crítico na API',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}