import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, default: '' },
    department: { type: String, default: 'Computer Science & Engineering' },
    section: { type: String, default: 'Section A' },
    
    courseCode: { type: String, default: 'All' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reasonCategory: { type: String, enum: ['Sick Leave', 'Medical Emergency', 'Family Emergency', 'Academic Event'], default: 'Sick Leave' },
    reason: { type: String, required: true },
    documentUrl: { type: String, default: '' }, // Medical certificate / prescription link
    
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    facultyComment: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date }
  },
  { timestamps: true }
);

export const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);
