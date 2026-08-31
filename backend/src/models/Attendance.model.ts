import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  class?: mongoose.Types.ObjectId;
  section?: mongoose.Types.ObjectId;
  date: Date;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  recordedBy: mongoose.Types.ObjectId;
  academicYear?: mongoose.Types.ObjectId;
  term?: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class' },
    section: { type: Schema.Types.ObjectId, ref: 'Section' },
    date: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['Present', 'Absent', 'Late', 'Excused'], 
      required: true 
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear' },
    term: { type: Schema.Types.ObjectId, ref: 'Term' },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same student on the same date for the same subject
attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
