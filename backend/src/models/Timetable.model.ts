import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetable extends Document {
  academicYear: mongoose.Types.ObjectId;
  term: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  room?: string;
}

const timetableSchema = new Schema<ITimetable>(
  {
    academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    term: { type: Schema.Types.ObjectId, ref: 'Term', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    dayOfWeek: { 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
      required: true 
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String },
  },
  { timestamps: true }
);

export const Timetable = mongoose.model<ITimetable>('Timetable', timetableSchema);