import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

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
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const { id } = req.query;
  
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "ID do documento não fornecido ou inválido" });
  }
  
  // Verificar se o ID é um ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("ID não é um ObjectId válido:", id);
    return res.status(400).json({ message: "Formato de ID inválido" });
  }

  switch (req.method) {
    case "GET":
      try {
        const document = await Document.findById(id);
        if (!document) {
          console.log("Documento não encontrado. ID:", id);
          return res.status(404).json({ message: "Documento não encontrado" });
        }
        
        res.status(200).json(document);
      } catch (error) {
        console.error("Erro ao buscar documento:", error);
        res.status(500).json({ 
          message: "Erro ao buscar documento", 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
      break;
      
    case "DELETE":
      try {
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
      
    case "PUT":
      try {
        const updateData = req.body;
        
        // Verificar se o documento existe
        const documentExists = await Document.findById(id);
        if (!documentExists) {
          console.log("Documento não encontrado para atualização. ID:", id);
          return res.status(404).json({ message: "Documento não encontrado" });
        }
        
        // Atualizar o documento
        const updatedDocument = await Document.findByIdAndUpdate(
          id, 
          updateData, 
          { new: true } // Retorna o documento atualizado
        );
        
        res.status(200).json({
          message: "Documento atualizado com sucesso",
          document: updatedDocument
        });
      } catch (error) {
        console.error("Erro ao atualizar documento:", error);
        res.status(500).json({ 
          message: "Erro ao atualizar documento", 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "DELETE", "PUT"]);
      res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}