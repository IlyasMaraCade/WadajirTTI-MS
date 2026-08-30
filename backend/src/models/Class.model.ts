import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Class = mongoose.model<IClass>('Class', classSchema);