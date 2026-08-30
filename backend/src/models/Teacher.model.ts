import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  teacherId: string;
  user?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: 'Male' | 'Female';
  dob?: Date;
  qualification: string;
  specialization: string;
  employmentStatus: 'Active' | 'On Leave' | 'Terminated';
  dateJoined: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    teacherId: { type: String, required: true, unique: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female'] },
    dob: { type: Date },
    qualification: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    employmentStatus: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' },
    dateJoined: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);