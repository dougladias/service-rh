import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Worker from "@/models/Worker";

// Como não temos o modelo Document, vamos criar um schema básico aqui
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

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await mongoose.connect(process.env.MONGODB_URI as string);

  switch (req.method) {
    case "GET":
      try {
        const { id } = req.query;
        
        // Se um ID for fornecido, retorna apenas esse documento
        if (id && typeof id === 'string') {
          // Verificar se o ID é um ObjectId válido
          if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log("ID não é um ObjectId válido:", id);
            return res.status(400).json({ message: "Formato de ID inválido" });
          }
          
          const document = await Document.findById(id);
          if (!document) {
            console.log("Documento não encontrado:", id);
            return res.status(404).json({ message: "Documento não encontrado" });
          }
          
          return res.status(200).json(document);
        }
        
        // Caso contrário, retorna todos os documentos
        const documents = await Document.find().sort({ createdAt: -1 });
        res.status(200).json(documents);
      } catch (error) {
        console.error("Erro ao buscar documentos:", error);
        res.status(500).json({ 
          message: "Erro ao buscar documentos", 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
      break;

    case "POST":
      try {
        // Configuração para salvar arquivos
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        
        // Garanta que a pasta existe
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Processa o upload do arquivo
        const form = new IncomingForm({
          uploadDir,
          keepExtensions: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB
          filename: (name, ext) => {
            return `${uuidv4()}${ext}`;
          },
        });

        return new Promise((resolve) => {
          form.parse(req, async (err, fields, files) => {
            if (err) {
              console.error("Erro no parse do formulário:", err);
              res.status(500).json({ error: "Erro ao processar o upload" });
              return resolve(false);
            }

            const fileArray = Array.isArray(files.file) ? files.file : [files.file];
            const file = fileArray[0];

            if (!file) {
              res.status(400).json({ error: "Nenhum arquivo enviado" });
              return resolve(false);
            }

            // Verificar se o funcionário existe
            const employeeId = Array.isArray(fields.employeeId) 
              ? fields.employeeId[0] 
              : fields.employeeId;

            if (!employeeId) {
              res.status(400).json({ error: "ID do funcionário não fornecido" });
              return resolve(false);
            }

            const worker = await Worker.findById(employeeId);
            if (!worker) {
              res.status(404).json({ error: "Funcionário não encontrado" });
              return resolve(false);
            }

            // Extrair informações dos campos
            const type = Array.isArray(fields.type) ? fields.type[0] : fields.type || "Outros";
            const department = Array.isArray(fields.department) ? fields.department[0] : fields.department || "";
            const expiryDate = Array.isArray(fields.expiryDate) ? fields.expiryDate[0] : fields.expiryDate || "";
            const tagsString = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags || "";
            const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

            // Verificar tipos de arquivo permitidos
            const allowedTypes = [
              "application/pdf",
              "image/jpeg",
              "image/png",
              "image/gif",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];

            if (!allowedTypes.includes(file.mimetype || "")) {
              // Remover o arquivo se não for permitido
              fs.unlinkSync(file.filepath);
              res.status(400).json({ error: "Tipo de arquivo não suportado" });
              return resolve(false);
            }

            // Obter a extensão do arquivo
            const originalFilename = file.originalFilename || "documento";
            const extension = path.extname(originalFilename).toLowerCase();
            const fileType = extension.substring(1); // Remove o ponto

            // Caminho final do arquivo
            const filename = path.basename(file.filepath);
            const filePath = `/uploads/${filename}`;

            // Criar o documento no banco de dados
            const document = new Document({
              name: originalFilename,
              type: type,
              employeeId: employeeId,
              employee: worker.name,
              department: department,
              uploadDate: new Date(),
              expiryDate: expiryDate || "Indeterminado",
              size: file.size,
              fileType: fileType,
              path: filePath,
              tags: tags
            });

            await document.save();

            res.status(201).json(document);
            return resolve(true);
          });
        });
      } catch (error) {
        console.error("Erro ao fazer upload de documento:", error);
        res.status(500).json({ 
          message: "Falha ao enviar documento", 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          console.log("ID inválido:", id);
          return res.status(400).json({ message: "ID do documento não fornecido ou inválido" });
        }

        // Verificar se o ID é um ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
          console.log("ID não é um ObjectId válido:", id);
          return res.status(400).json({ message: "Formato de ID inválido" });
        }

        // Verificar primeiro se o documento existe
        const documentExists = await Document.findById(id);
        if (!documentExists) {
          console.log("Documento não encontrado para exclusão. ID:", id);
          return res.status(404).json({ message: "Documento não encontrado" });
        }

        // Agora que confirmamos que o documento existe, podemos excluí-lo
        const deletedDocument = await Document.findByIdAndDelete(id);

        // Opcional: Remover o arquivo físico se ele existir
        const filePath = path.join(process.cwd(), "public", documentExists.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("Arquivo físico removido:", filePath);
        }

        res.status(200).json({ 
          message: "Documento excluído com sucesso", 
          document: deletedDocument 
        });
      } catch (error) {
        console.error("Erro ao excluir documento:", error);
        res.status(500).json({ 
          message: "Erro ao excluir documento", 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}