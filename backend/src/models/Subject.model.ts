import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  times?: string;
  teacher?: mongoose.Types.ObjectId;
  isActive: boolean;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    times: { type: String, trim: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);