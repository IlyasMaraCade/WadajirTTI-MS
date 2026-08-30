import mongoose, { Schema, Document } from 'mongoose';

export interface ISection extends Document {
  name: string;
  classId: mongoose.Types.ObjectId;
  capacity?: number;
  isActive: boolean;
}

const sectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true, trim: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    capacity: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Section = mongoose.model<ISection>('Section', sectionSchema);