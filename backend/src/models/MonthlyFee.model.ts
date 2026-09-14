import mongoose, { Schema, Document } from 'mongoose';

export interface IMonthlyFee extends Document {
  student: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;
  amount: number;
  status: 'Paid' | 'Unpaid'; // Unpaid might be explicitly saved sometimes, or implied missing
  paymentDate?: Date;
  recordedBy?: mongoose.Types.ObjectId;
  notes?: string;
}

const monthlyFeeSchema = new Schema<IMonthlyFee>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Paid' },
    paymentDate: { type: Date, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

monthlyFeeSchema.index({ student: 1, year: 1, month: 1 }, { unique: true });

export const MonthlyFee = mongoose.model<IMonthlyFee>('MonthlyFee', monthlyFeeSchema);