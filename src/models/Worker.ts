import mongoose, { Schema, Document } from "mongoose";

interface IEntry {
  entryTime?: Date;
  leaveTime?: Date;
  faltou?: boolean;
  date?: Date;
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
  contract: string;
  role: string;
  /**
   * Optional new fields
   * - Make them optional so existing code & data won't break
   */
  department?: string; 
  status?: "active" | "inactive" | "other";
  logs: IEntry[];
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
  contract: { type: String, required: true },
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
});

export default mongoose.models.Worker || mongoose.model<IWorker>("Worker", WorkerSchema);
