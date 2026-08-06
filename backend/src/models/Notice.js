import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Academic', 'Exam', 'Administrative', 'Event', 'General'], 
      default: 'Academic' 
    },
    department: { type: String, default: 'All Departments' },
    isUrgent: { type: Boolean, default: false },
    publishedBy: { type: String, required: true }, // Faculty name/email
    facultyRole: { type: String, default: 'Faculty' },
    attachments: [{ type: String }],
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

export const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
