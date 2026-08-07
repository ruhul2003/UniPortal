import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['student', 'faculty', 'admin'], 
      default: 'student' 
    },
    department: { type: String, default: 'Computer Science & Engineering' },
    studentId: { type: String, default: '' },
    section: { type: String, default: 'Section A' }, // E.g. Section A, Section B, Section C, Section D
    facultyId: { type: String, default: '' },
    designation: { type: String, default: '' }, // For faculty (e.g. Associate Professor)
    acronym: { type: String, default: '' }, // Faculty acronym e.g. SAB, AV, MT
    phone: { type: String, default: '' }, // Phone number e.g. +880 1711-234567
    isCR: { type: Boolean, default: false }, // Class Representative flag
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
