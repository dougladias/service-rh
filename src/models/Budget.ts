// src/models/Budget.ts
import mongoose, { Schema, Document } from 'mongoose';

// Tipos de orçamento
export type BudgetType = 'departmental' | 'project' | 'operational';
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
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['departmental', 'project', 'operational'],
    required: true
  },
  year: { 
    type: Number, 
    required: true,
    min: 2000,
    max: 2100
  },
  department: { 
    type: String,
    trim: true
  },
  totalEstimatedValue: { 
    type: Number, 
    required: true,
    min: 0
  },
  totalActualValue: { 
    type: Number,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['draft', 'approved', 'rejected', 'in_progress'],
    default: 'draft'
  },
  items: [{
    description: { 
      type: String, 
      required: true,
      trim: true
    },
    category: { 
      type: String, 
      required: true,
      trim: true
    },
    estimatedValue: { 
      type: Number, 
      required: true,
      min: 0
    },
    actualValue: { 
      type: Number,
      min: 0
    }
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Worker',
    required: true
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
    type: String 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
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

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);