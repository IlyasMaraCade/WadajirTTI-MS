import mongoose, { Schema, Document } from 'mongoose';

export interface IMark extends Document {
  exam: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  score: number;
  grade: string;
  remarks?: string;
  recordedBy: mongoose.Types.ObjectId;
}

const markSchema = new Schema(
  {
    exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    score: { type: Number, required: true, min: 0 },
    grade: { type: String, required: true },
    remarks: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  },
  { timestamps: true }
);

// Prevent multiple marks for the same student in the same exam
markSchema.index({ exam: 1, student: 1 }, { unique: true });

export default mongoose.model<IMark>('Mark', markSchema);
