import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  student: mongoose.Types.ObjectId;
  studentName: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Cancelled';
  dueDate: Date;
  issuedDate: Date;
  issuedBy: mongoose.Types.ObjectId;
  notes?: string;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    description: { type: String, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0 },
    status: { type: String, enum: ['Unpaid', 'Partial', 'Paid', 'Cancelled'], default: 'Unpaid' },
    dueDate: { type: Date, required: true },
    issuedDate: { type: Date, default: Date.now },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

invoiceSchema.index({ student: 1, status: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
