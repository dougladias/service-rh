import mongoose, { Schema, Document } from "mongoose";

interface IEntry {
  entryTime: Date;
  leaveTime?: Date;
};

export interface iPrestador extends Document {
  name: string;
  company: string;
  address: string;
  phone: string;
  service: string;
  rg: string;
  cpf: string;
  cnpj: string;
  logs: IEntry[];
  createdAt: Date;
};

const PrestadorSchema = new Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  rg: { type: String, required: true },
  cpf: { type: String, required: true },
  cnpj: { type: String, required: true },
  address: { type: String, required: true },
  logs: [
    {
      entryTime: { type: Date, required: true },
      leaveTime: { type: Date },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Prestador || mongoose.model<iPrestador>("Prestadores", PrestadorSchema);