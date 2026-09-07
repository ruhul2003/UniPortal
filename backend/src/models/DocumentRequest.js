import mongoose from 'mongoose';

const documentRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, default: '' },
    department: { type: String, default: 'Computer Science & Engineering' },
    section: { type: String, default: 'Section A' },

    documentType: {
      type: String,
      required: true,
      enum: [
        'Official Transcript & Grade Sheet',
        'Clearance Certificate',
        'Testimonial & Character Certificate',
        'Provisional Degree Certificate',
        'Semester Result Sheet'
      ]
    },
    purpose: { type: String, required: true },
    deliveryMode: {
      type: String,
      default: 'Digital PDF Download',
      enum: ['Digital PDF Download', 'Physical Campus Pickup', 'Express Courier Delivery']
    },
    isUrgent: { type: Boolean, default: false },
    reason: { type: String, default: '' },

    status: {
      type: String,
      enum: ['Pending', 'In Processing', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    trackingCode: { type: String, required: true },
    adminRemarks: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    approvedAt: { type: Date },
    rejectedAt: { type: Date }
  },
  { timestamps: true }
);

// Indexes for fast lookup by student ID, status, and tracking code
documentRequestSchema.index({ studentId: 1, createdAt: -1 });
documentRequestSchema.index({ trackingCode: 1 });
documentRequestSchema.index({ status: 1 });

export const DocumentRequest = mongoose.models.DocumentRequest || mongoose.model('DocumentRequest', documentRequestSchema);
