import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicYear extends Document {
  year: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const academicYearSchema = new Schema<IAcademicYear>(
  {
    year: { type: String, required: true, unique: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AcademicYear = mongoose.model<IAcademicYear>('AcademicYear', academicYearSchema);