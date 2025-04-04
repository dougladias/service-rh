import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/api/mongodb';
import Invoice, { IInvoice } from '@/models/Invoice';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false, // Desabilita o bodyParser para processar upload de arquivos
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        try {
          // Buscar todas as notas fiscais
          const invoices = await Invoice.find().sort({ date: -1 });
          return res.status(200).json(invoices);
        } catch (error) {
          console.error('Erro ao buscar notas fiscais:', error);
          return res.status(500).json({ message: 'Erro ao buscar notas fiscais' });
        }

      case 'POST':
        try {
          // Configuração do formidable para upload de arquivos
          const uploadDir = path.join(process.cwd(), 'public/uploads/invoices');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const form = new IncomingForm({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
          });

          return new Promise((resolve) => {
            form.parse(req, async (err, fields, files) => {
              if (err) {
                console.error('Erro no upload:', err);
                res.status(500).json({ message: 'Erro no upload do arquivo' });
                return resolve(false);
              }

              // Converter campos para o tipo correto
              const fileArray = Array.isArray(files.file) ? files.file : [files.file];
              const file = fileArray[0];

              const invoiceData: Partial<IInvoice> = {
                number: Array.isArray(fields.number) ? fields.number[0] : fields.number,
                serie: Array.isArray(fields.serie) ? fields.serie[0] : fields.serie,
                type: (Array.isArray(fields.type) 
                  ? (fields.type[0] === "entrada" || fields.type[0] === "saida" ? fields.type[0] : "entrada") 
                  : (fields.type === "entrada" || fields.type === "saida" ? fields.type : "entrada")) as "entrada" | "saida",
                date: fields.date ? new Date(Array.isArray(fields.date) ? fields.date[0] : fields.date) : new Date(),
                totalValue: parseFloat(Array.isArray(fields.totalValue) ? fields.totalValue[0] : fields.totalValue || '0'),
                supplierId: Array.isArray(fields.supplierId) ? fields.supplierId[0] : fields.supplierId,
                supplier: Array.isArray(fields.supplier) ? fields.supplier[0] : fields.supplier,
                description: Array.isArray(fields.description) ? fields.description[0] : fields.description,
                status: 'pendente'
              };

              // Processar arquivo da nota fiscal
              if (file) {
                const fileId = uuidv4();
                const fileExtension = path.extname(file.originalFilename || '');
                const newFilename = `${fileId}${fileExtension}`;
                const newFilePath = path.join(uploadDir, newFilename);

                // Mover arquivo
                fs.renameSync(file.filepath, newFilePath);
                invoiceData.filePath = `/uploads/invoices/${newFilename}`;
              }

              // Processamento dos itens
              const itemsData = JSON.parse(
                Array.isArray(fields.items) ? fields.items[0] : fields.items || '[]'
              );

              // Interface para o item de nota fiscal
              interface InvoiceItemData {
                name: string;
                quantity: number;
                unitPrice: number;
              }

              invoiceData.items = itemsData.map((item: InvoiceItemData) => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice
              }));

              // Criar nota fiscal
              const newInvoice = new Invoice(invoiceData);
              await newInvoice.save();

              res.status(201).json(newInvoice);
              return resolve(true);
            });
          });
        } catch (error) {
          console.error('Erro ao criar nota fiscal:', error);
          return res.status(500).json({ message: 'Erro ao criar nota fiscal' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Método ${req.method} não permitido`);
    }
  } catch (error) {
    console.error('Erro crítico na API de notas fiscais:', error);
    return res.status(500).json({ message: 'Erro crítico na API' });
  }
}