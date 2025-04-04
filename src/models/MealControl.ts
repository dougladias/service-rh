// src/models/MealControl.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMealRecord {
  _id?: mongoose.Types.ObjectId; // Ou simplesmente any
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  provided: boolean;
  cost?: number;
  notes?: string;
}

export interface IMealControl extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  department: string;
  hasMealAllowance: boolean;
  mealPlanType: 'daily' | 'flexible' | 'none';
  monthlyBudget?: number;
  mealRecords: IMealRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const MealRecordSchema = new Schema({
  date: { 
    type: Date, 
    required: true 
  },
  mealType: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
    required: true 
  },
  provided: { 
    type: Boolean, 
    default: false 
  },
  cost: { 
    type: Number 
  },
  notes: { 
    type: String 
  }
}, { _id: true });

const MealControlSchema = new Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Worker', 
    required: true 
  },
  employeeName: { 
    type: String, 
    required: true 
  },
  department: { 
    type: String, 
    required: true 
  },
  hasMealAllowance: { 
    type: Boolean, 
    default: false 
  },
  mealPlanType: { 
    type: String, 
    enum: ['daily', 'flexible', 'none'], 
    default: 'none' 
  },
  monthlyBudget: { 
    type: Number 
  },
  mealRecords: [MealRecordSchema]
}, { 
  timestamps: true 
});

// Índices para melhorar a performance das consultas
MealControlSchema.index({ employeeId: 1 });
MealControlSchema.index({ 'mealRecords.date': 1 });
MealControlSchema.index({ employeeId: 1, 'mealRecords.date': 1 });

export default mongoose.models.MealControl || 
  mongoose.model<IMealControl>("MealControl", MealControlSchema);