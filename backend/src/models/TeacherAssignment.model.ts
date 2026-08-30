import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacherAssignment extends Document {
  teacher: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  isActive: boolean;
}

const assignmentSchema = new Schema<ITeacherAssignment>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

assignmentSchema.index({ teacher: 1, subject: 1, section: 1, academicYear: 1 }, { unique: true });

export const TeacherAssignment = mongoose.model<ITeacherAssignment>('TeacherAssignment', assignmentSchema);