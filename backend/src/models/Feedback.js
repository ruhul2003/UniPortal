import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    studentId: { type: String, default: '' },
    studentName: { type: String, default: 'Anonymous Student' },
    studentEmail: { type: String, default: '' },
    facultyId: { type: String, required: true },
    facultyName: { type: String, required: true },
    facultyEmail: { type: String, default: '' },
    department: { type: String, default: 'Computer Science & Engineering' },
    courseCode: { type: String, required: true },
    courseTitle: { type: String, required: true },
    semester: { type: String, default: 'Spring 2026' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    teachingQuality: { type: Number, default: 5, min: 1, max: 5 },
    courseContent: { type: Number, default: 5, min: 1, max: 5 },
    communication: { type: Number, default: 5, min: 1, max: 5 },
    comment: { type: String, default: '' },
    isAnonymous: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
