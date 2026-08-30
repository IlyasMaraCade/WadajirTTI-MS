import mongoose, { Schema, Document } from 'mongoose';

export const COURSES = [
  'Cilaan',
  'Makeup',
  'Ubax Sameyn',
  'English',
  'Somali',
  'Xisaab',
  'Harqaan',
  'Crochet',
  'Computer',
] as const;

export type Course = (typeof COURSES)[number];

export interface IStudent extends Document {
  studentId: string;
  fullName: string;
  gender: 'Male' | 'Female';
  phone?: string;
  parentName: string;
  parentPhone: string;
  fee: number;
  registrationFee: number;
  courses: Course[];
  enrollmentStatus: 'Active' | 'Completed' | 'Transferred' | 'Withdrawn' | 'Suspended';
  status: boolean;
}

const studentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    phone: { type: String, trim: true },
    parentName: { type: String, required: true, trim: true },
    parentPhone: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, min: 0, default: 0 },
    registrationFee: { type: Number, required: true, min: 0, default: 0 },
    courses: [{ type: String, enum: COURSES }],
    enrollmentStatus: {
      type: String,
      enum: ['Active', 'Completed', 'Transferred', 'Withdrawn', 'Suspended'],
      default: 'Active',
    },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studentSchema.index({ fullName: 'text', studentId: 1 });
studentSchema.index({ status: 1, enrollmentStatus: 1 });

export const Student = mongoose.model<IStudent>('Student', studentSchema);