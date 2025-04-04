import mongoose, { Schema, Document } from 'mongoose';

// Interface para representar os dados de uma nota fiscal
export interface IInvoice extends Document {
  number: string;            // Número da nota fiscal
  serie: string;             // Série da nota
  type: 'entrada' | 'saida'; // Tipo de nota (entrada ou saída)
  date: Date;                // Data de emissão
  totalValue: number;        // Valor total da nota
  supplierId?: string;       // ID do fornecedor (opcional)
  supplier?: string;         // Nome do fornecedor
  description?: string;      // Descrição adicional
  filePath?: string;         // Caminho do arquivo da nota fiscal
  items: {
    name: string;            // Nome do item
    quantity: number;        // Quantidade
    unitPrice: number;       // Preço unitário
    totalPrice: number;      // Preço total
  }[];
  status: 'pendente' | 'processado' | 'cancelado';
}

const InvoiceSchema: Schema = new mongoose.Schema({
  number: { 
    type: String, 
    required: true,
    unique: true 
  },
  serie: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['entrada', 'saida'], 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  totalValue: { 
    type: Number, 
    required: true 
  },
  supplierId: { 
    type: String 
  },
  supplier: { 
    type: String 
  },
  description: { 
    type: String 
  },
  filePath: { 
    type: String 
  },
  items: [{
    name: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true 
    },
    unitPrice: { 
      type: Number, 
      required: true 
    },
    totalPrice: { 
      type: Number, 
      required: true 
    }
  }],
  status: { 
    type: String, 
    enum: ['pendente', 'processado', 'cancelado'], 
    default: 'pendente' 
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);