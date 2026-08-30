import mongoose, { Schema, Document } from 'mongoose';

export interface ITerm extends Document {
  name: string;
  academicYear: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const termSchema = new Schema<ITerm>(
  {
    name: { type: String, required: true, trim: true },
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Term = mongoose.model<ITerm>('Term', termSchema);