import mongoose, { Schema, Document } from "mongoose";

interface IEntry {
  entryTime: Date;
  leaveTime?: Date;
}

export interface iVisitor extends Document {
  name: string;
  rg: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  logs: IEntry[];
  createdAt: Date;
}

const VisitorSchema = new Schema({
  name: { type: String, required: true },
  rg: { type: String, required: true },
  cpf: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  logs: [
    {
      entryTime: { type: Date, required: true },
      leaveTime: { type: Date },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Visitor || mongoose.model<iVisitor>("Visitor", VisitorSchema);