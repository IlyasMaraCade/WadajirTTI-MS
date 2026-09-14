import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentNumber: string;
  invoice?: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  studentName: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  receivedBy: mongoose.Types.ObjectId;
  date: Date;
  notes?: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentNumber: { type: String, required: true, unique: true },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentMethod: {
      type: String,
      default: 'EVC Plus',
    },
    reference: { type: String },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ invoice: 1 });
paymentSchema.index({ student: 1, date: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
