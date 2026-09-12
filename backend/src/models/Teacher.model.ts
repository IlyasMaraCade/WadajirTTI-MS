import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  teacherId: string;
  user?: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  subjects: string[];
  time?: string;
  credentials?: string;
  employmentStatus: 'Active' | 'On Leave' | 'Terminated';
}

const teacherSchema = new Schema<ITeacher>(
  {
    teacherId: { type: String, required: true, unique: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subjects: [{ type: String }],
    time: { type: String, trim: true },
    credentials: { type: String, trim: true },
    employmentStatus: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);