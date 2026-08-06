import mongoose from 'mongoose';

const routineSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true },
    courseTitle: { type: String, required: true },
    day: { 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
      required: true 
    },
    startTime: { type: String, required: true }, // e.g. "09:00 AM"
    endTime: { type: String, required: true },   // e.g. "10:30 AM"
    room: { type: String, required: true },
    department: { type: String, default: 'Computer Science & Engineering' },
    semester: { type: String, default: 'Spring 2026' },
    section: { type: String, default: 'A' },
    facultyName: { type: String, required: true },
    building: { type: String, default: 'Academic Building 1' },
  },
  { timestamps: true }
);

export const Routine = mongoose.models.Routine || mongoose.model('Routine', routineSchema);
