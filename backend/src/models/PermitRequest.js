import mongoose from 'mongoose';

const permitRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    department: { type: String, default: 'Computer Science & Engineering' },
    section: { type: String, default: 'Section A' },
    dueAmount: { type: Number, required: true },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    facultyId: { type: String, default: '' },
    facultyName: { type: String, required: true },
    facultyEmail: { type: String, required: true },
    facultyAcronym: { type: String, default: '' },

    permitDate: { type: String, required: true }, // e.g. "2026-08-25"
    reason: { type: String, required: true },
    
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Cancelled'],
      default: 'Pending'
    },
    facultyComment: { type: String, default: '' },
    
    passCode: { type: String, required: true }, // Verification token e.g. PERMIT-2026-X9A2
    approvedAt: { type: Date },
    cancelledAt: { type: Date }
  },
  { timestamps: true }
);

export const PermitRequest = mongoose.models.PermitRequest || mongoose.model('PermitRequest', permitRequestSchema);
