import mongoose, { Schema, Document } from "mongoose";

// Interface for log entries
interface IEntry {
  entryTime: Date;
  leaveTime?: Date;
}

// Interface for the Visitor document
export interface iVisitor extends Document {
  name: string;
  rg: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  photo?: string; // Optional photo field
  logs: IEntry[];
  createdAt: Date;
}

// Mongoose schema for Visitors
const VisitorSchema = new Schema<iVisitor>({
  name: { 
    type: String, 
    required: true,
    trim: true // Remove whitespace from beginning and end
  },
  rg: { 
    type: String, 
    required: true,
    trim: true
  },
  cpf: { 
    type: String, 
    required: true,
    unique: true, // Ensure unique CPF
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic CPF validation (can be expanded)
        return /^\d{11}$/.test(v.replace(/[^\d]/g, ''));
      },
      message: 'Invalid CPF format'
    }
  },
  phone: { 
    type: String, 
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic phone number validation
        return /^[1-9]{2}9?[0-9]{8}$/.test(v.replace(/[^\d]/g, ''));
      },
      message: 'Invalid phone number format'
    }
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Basic email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  address: { 
    type: String, 
    required: true,
    trim: true
  },
  photo: { 
    type: String // Base64 encoded image
  },
  logs: [
    {
      entryTime: { 
        type: Date, 
        required: true,
        default: Date.now
      },
      leaveTime: { 
        type: Date 
      },
    },
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  // Additional schema options
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true }, // Include virtual properties when converting to JSON
  toObject: { virtuals: true } // Include virtual properties when converting to object
});

// Indexes to improve query performance
VisitorSchema.index({ cpf: 1 });
VisitorSchema.index({ createdAt: -1 });
VisitorSchema.index({ name: 'text', email: 'text' }); // Text search index

// Virtual property to get the last log entry
VisitorSchema.virtual('lastLog').get(function() {
  return this.logs.length > 0 ? this.logs[this.logs.length - 1] : null;
});

// Pre-save hook for additional validation or processing
VisitorSchema.pre('save', function(next) {
  // Normalize CPF and phone number (remove non-digit characters)
  if (this.cpf) this.cpf = this.cpf.replace(/[^\d]/g, '');
  if (this.phone) this.phone = this.phone.replace(/[^\d]/g, '');
  
  next();
});

// Create the model, avoiding model re-compilation
export default mongoose.models.Visitor || mongoose.model<iVisitor>("Visitor", VisitorSchema);