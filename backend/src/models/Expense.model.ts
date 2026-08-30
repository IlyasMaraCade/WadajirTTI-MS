import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  expenseNumber: string;
  category: 'Salaries' | 'Utilities' | 'Rent' | 'Supplies' | 'Maintenance' | 'Events' | 'Other';
  title: string;
  description?: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money';
  reference?: string;
  date: Date;
  recordedBy: mongoose.Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>(
  {
    expenseNumber: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['Salaries', 'Utilities', 'Rent', 'Supplies', 'Maintenance', 'Events', 'Other'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Mobile Money'],
      default: 'Cash',
    },
    reference: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);

