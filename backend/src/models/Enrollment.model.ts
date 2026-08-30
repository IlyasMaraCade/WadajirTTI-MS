import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  term?: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  status: 'Active' | 'Completed' | 'Transferred' | 'Withdrawn' | 'Suspended';
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    term: { type: Schema.Types.ObjectId, ref: 'Term' },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    status: { 
      type: String, 
      enum: ['Active', 'Completed', 'Transferred', 'Withdrawn', 'Suspended'], 
      default: 'Active' 
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, academicYear: 1 }, { unique: true });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);