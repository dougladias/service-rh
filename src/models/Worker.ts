// src/models/Worker.ts
import mongoose, { Schema, Document } from "mongoose";

interface IEntry {
  entryTime?: Date;
  leaveTime?: Date;
  faltou?: boolean;
  date?: Date;
  createdAt?: Date;
  absent?: boolean;
}

// Nova interface para arquivos
interface IFile {
  filename: string;      // Nome do arquivo no sistema
  originalName: string;  // Nome original do arquivo
  mimetype: string;      // Tipo do arquivo (ex: application/pdf)
  size: number;          // Tamanho em bytes
  path: string;          // Caminho de acesso
  uploadDate: Date;      // Data de upload
  description?: string;  // Descrição opcional
  category?: string;     // Categoria do documento (RG, CPF, etc)
}

export interface IWorker extends Document {
  name: string;
  cpf: string;
  nascimento: Date;
  admissao: Date;
  salario: string;
  ajuda?: string;
  numero: string;
  email: string;
  address: string;
  contract: string;     // Agora limitado a "CLT" ou "PJ"
  role: string;
  /**
   * Optional new fields
   * - Make them optional so existing code & data won't break
   */
  department?: string; 
  status?: "active" | "inactive" | "other";
  logs: IEntry[];
  
  // Campo para arquivos
  files?: IFile[];
}

const WorkerSchema = new Schema<IWorker>({
  name: { type: String, required: true },
  cpf: { type: String, required: true },
  nascimento: { type: Date, required: true },
  admissao: { type: Date, required: true },
  salario: { type: String, required: true },
  ajuda: { type: String },
  numero: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  contract: { 
    type: String, 
    required: true,
    enum: ["CLT", "PJ"] // Restringe os valores a somente CLT ou PJ
  },
  role: { type: String, required: true },

  // New optional fields
  department: { type: String, required: false },
  status: { type: String, default: "active", required: false },

  logs: [
    {
      entryTime: { type: Date },
      leaveTime: { type: Date },
      faltou: { type: Boolean, default: false },
      date: { type: Date },
    },
  ],
  
  // Schema para arquivos
  files: [
    {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimetype: { type: String, required: true },
      size: { type: Number, required: true },
      path: { type: String, required: true },
      uploadDate: { type: Date, default: Date.now },
      description: { type: String },
      category: { type: String }
    }
  ]
});

export default mongoose.models.Worker || mongoose.model<IWorker>("Worker", WorkerSchema);