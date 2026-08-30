import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: Date;
  gender: 'Male' | 'Female';
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail?: string;
  enrollmentStatus: 'Active' | 'Completed' | 'Transferred' | 'Withdrawn' | 'Suspended';
  status: boolean;
}

const studentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    guardianName: { type: String, required: true, trim: true },
    guardianRelationship: { type: String, required: true, trim: true },
    guardianPhone: { type: String, required: true, trim: true },
    guardianEmail: { type: String, trim: true },
    enrollmentStatus: { 
      type: String, 
      enum: ['Active', 'Completed', 'Transferred', 'Withdrawn', 'Suspended'], 
      default: 'Active' 
    },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>('Student', studentSchema);