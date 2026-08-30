import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description?: string;
  dueDate: Date;
  class: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  academicYear: mongoose.Types.ObjectId;
  term?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: 'Active' | 'Closed';
}

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    term: { type: Schema.Types.ObjectId, ref: 'Term' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', assignmentSchema);
