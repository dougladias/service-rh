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

// Interface para arquivos
interface IFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadDate: Date;
  description?: string;
  category?: string;
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
  contract: string;     // "CLT" ou "PJ"
  role: string;
  department: string;   // Tornando este campo obrigatório
  status?: "active" | "inactive" | "other";
  logs: IEntry[];
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
    enum: ["CLT", "PJ"]
  },
  role: { type: String, required: true },
  
  // Departamento como campo obrigatório, com valor padrão
  department: { 
    type: String, 
    required: true,
    default: 'Geral' 
  },
  
  status: { 
    type: String, 
    default: "active", 
    enum: ["active", "inactive", "other"] 
  },

  logs: [
    {
      entryTime: { type: Date },
      leaveTime: { type: Date },
      faltou: { type: Boolean, default: false },
      date: { type: Date },
    },
  ],
  
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