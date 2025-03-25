import mongoose, { Schema, Document } from "mongoose";

// Interface para o modelo de documento
export interface IDocumentModel extends Document {
  name: string;
  type: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  format: string;
  filePath?: string;   // Caminho do arquivo
  isActive: boolean;
}

const DocumentModelSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  format: { type: String, required: true },
  filePath: { type: String },
  isActive: { type: Boolean, default: true }
});

// Middleware para atualizar a data de atualização sempre que o documento for modificado
DocumentModelSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

export default mongoose.models.DocumentModel || 
  mongoose.model<IDocumentModel>("DocumentModel", DocumentModelSchema);