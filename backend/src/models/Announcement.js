import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tag: { 
      type: String, 
      enum: ['Urgent', 'Holiday', 'Seminar', 'Workshop', 'Admission', 'General'], 
      default: 'General' 
    },
    isPinned: { type: Boolean, default: false },
    publishedBy: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
