import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  name: string;
  type: string;
  date: Date;
  maxMarks: number;
  class?: mongoose.Types.ObjectId;
  section?: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId;
  subjectName?: string; // allow strings for subjects not in DB
  academicYear?: mongoose.Types.ObjectId;
  term?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: 'Upcoming' | 'Completed' | 'Published';
}

const examSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'Quiz', 'Midterm', 'Final', 'Practical'
    date: { type: Date, required: true },
    maxMarks: { type: Number, required: true, min: 1 },
    class: { type: Schema.Types.ObjectId, ref: 'Class' },
    section: { type: Schema.Types.ObjectId, ref: 'Section' },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    subjectName: { type: String },
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear' },
    term: { type: Schema.Types.ObjectId, ref: 'Term' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['Upcoming', 'Completed', 'Published'], 
      default: 'Upcoming' 
    },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>('Exam', examSchema);
