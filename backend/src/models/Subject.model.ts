import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  description?: string;
  credits?: number;
  isActive: boolean;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    credits: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);