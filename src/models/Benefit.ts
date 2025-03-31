// src/models/Benefit.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

// Interface para o tipo de benefício
export interface IBenefitType extends Document {
  name: string;
  description: string;
  hasDiscount: boolean;
  discountPercentage?: number;
  defaultValue: number;
  status: 'active' | 'inactive';
}

// Interface para benefícios do funcionário
export interface IEmployeeBenefit extends Document {
  employeeId: mongoose.Types.ObjectId;
  benefitTypeId: mongoose.Types.ObjectId | IBenefitType;
  value: number;
  status: 'active' | 'inactive';
  startDate: Date;
  endDate?: Date;
}

// Schema para Tipos de Benefícios
const BenefitTypeSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  hasDiscount: { 
    type: Boolean, 
    default: false 
  },
  discountPercentage: { 
    type: Number,
    min: 0,
    max: 100
  },
  defaultValue: { 
    type: Number, 
    required: true,
    min: 0 
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

// Schema para Benefícios dos Funcionários
const EmployeeBenefitSchema: Schema = new Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Worker', 
    required: true,
    index: true // Adicionar índice para melhorar performance de consultas
  },
  benefitTypeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BenefitType', 
    required: true 
  },
  value: { 
    type: Number, 
    required: true,
    min: 0 
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true // Adicionar índice para melhorar performance de consultas
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  endDate: { 
    type: Date 
  }
}, { timestamps: true });

// Índice composto para garantir restrição de unicidade (um funcionário não pode ter o mesmo benefício ativo duas vezes)
EmployeeBenefitSchema.index({ employeeId: 1, benefitTypeId: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: 'active' } 
});

// Criar modelos
export const BenefitType = models.BenefitType || model<IBenefitType>('BenefitType', BenefitTypeSchema);
export const EmployeeBenefit = models.EmployeeBenefit || model<IEmployeeBenefit>('EmployeeBenefit', EmployeeBenefitSchema);

const Benefits = { BenefitType, EmployeeBenefit };
export default Benefits;