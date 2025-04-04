
import mongoose, { Schema, Document } from 'mongoose';

// Tipos de orçamento
export type BudgetType = 'departamental' | 'projeto' | 'operacional';
export type BudgetStatus = 'draft' | 'approved' | 'rejected' | 'in_progress';

// Interface para item de orçamento
export interface BudgetItem {
  description: string;
  category: string;
  estimatedValue: number;
  actualValue?: number;
}

// Interface para o modelo de Orçamento
export interface IBudget extends Document {
  title: string;
  type: BudgetType;
  year: number;
  department?: string;
  totalEstimatedValue: number;
  totalActualValue?: number;
  status: BudgetStatus;
  items: BudgetItem[];
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

// Schema de Orçamento
const BudgetSchema: Schema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Título do orçamento é obrigatório'],
    trim: true,
    minlength: [3, 'Título deve ter pelo menos 3 caracteres']
  },
  type: {
    type: String,
    enum: {
      values: ['departamental', 'projeto', 'operacional'],
      message: 'Tipo de orçamento inválido'
    },
    required: [true, 'Tipo de orçamento é obrigatório']
  },
  year: {
    type: Number,
    required: [true, 'Ano é obrigatório'],
    min: [2000, 'Ano deve ser maior que 2000'],
    max: [2100, 'Ano deve ser menor que 2100']
  },
  department: { 
    type: String,
    trim: true
  },
  totalEstimatedValue: {
    type: Number,
    required: [true, 'Valor total estimado é obrigatório'],
    min: [0, 'Valor total não pode ser negativo']
  },
  totalActualValue: { 
    type: Number,
    min: [0, 'Valor total não pode ser negativo']
  },
  status: { 
    type: String, 
    enum: {
      values: ['draft', 'approved', 'rejected', 'in_progress'],
      message: 'Status de orçamento inválido'
    },
    default: 'draft'
  },
  items: [{
    description: { 
      type: String, 
      required: [true, 'Descrição do item é obrigatória'],
      trim: true
    },
    category: { 
      type: String, 
      required: [true, 'Categoria do item é obrigatória'],
      trim: true
    },
    estimatedValue: { 
      type: Number, 
      required: [true, 'Valor estimado do item é obrigatório'],
      min: [0, 'Valor do item não pode ser negativo']
    },
    actualValue: { 
      type: Number,
      min: [0, 'Valor do item não pode ser negativo']
    }
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Worker',
    required: [true, 'Usuário criador é obrigatório']
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Worker'
  },
  startDate: { 
    type: Date 
  },
  endDate: { 
    type: Date 
  },
  notes: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Notas não podem exceder 1000 caracteres']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: true
});

// Índices para melhorar performance
BudgetSchema.index({ year: 1, type: 1, department: 1 });
BudgetSchema.index({ status: 1 });
BudgetSchema.index({ createdBy: 1 });

// Virtual para calcular variação entre valor estimado e real
BudgetSchema.virtual('variancePercentage').get(function(this: IBudget) {
  if (!this.totalEstimatedValue || !this.totalActualValue) return null;
  return ((this.totalActualValue - this.totalEstimatedValue) / this.totalEstimatedValue) * 100;
});

// Validação personalizada
BudgetSchema.pre('save', function(this: IBudget, next) {
  // Garantir que o total estimado seja calculado corretamente
  if (this.items && this.items.length > 0) {
    const calculatedTotal = this.items.reduce((sum, item) => sum + item.estimatedValue, 0);
    if (Math.abs(calculatedTotal - this.totalEstimatedValue) > 0.01) {
      this.totalEstimatedValue = calculatedTotal;
    }
  }

  // Validar datas
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    next(new Error('Data de início não pode ser posterior à data de término'));
  }

  next();
});

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);