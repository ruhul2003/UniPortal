import express from 'express';
import { Notice } from '../models/Notice.js';

const router = express.Router();

let initialNotices = [
  {
    _id: 'n_1',
    title: 'Spring 2026 Midterm Examination Schedule Released',
    content: 'The official schedule for Midterm Examinations Spring 2026 has been published. All students are advised to check their respective course dates and room allocations carefully.',
    category: 'Exam',
    department: 'All Departments',
    isUrgent: true,
    publishedBy: 'Dr. Sarah Jenkins',
    facultyRole: 'Controller of Examinations',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'n_2',
    title: 'Submission Deadline for Capstone Project Proposal',
    content: 'All 7th & 8th-semester CSE students must submit their initial Capstone Project design document to the department office by February 15th, 2026.',
    category: 'Academic',
    department: 'Computer Science & Engineering',
    isUrgent: false,
    publishedBy: 'Prof. Alan Vance',
    facultyRole: 'Head of CSE',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    _id: 'n_3',
    title: 'Campus Maintenance & Library Hours Update',
    content: 'The Central Library will operate with extended opening hours (8:00 AM - 10:00 PM) during the upcoming exam week. Wi-Fi maintenance will occur on Sunday midnight.',
    category: 'Administrative',
    department: 'All Departments',
    isUrgent: false,
    publishedBy: 'Admin Office',
    facultyRole: 'System Administrator',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

// GET all notices
router.get('/', async (req, res) => {
  try {
    try {
      const dbNotices = await Notice.find().sort({ createdAt: -1 });
      if (dbNotices && dbNotices.length > 0) {
        return res.json({ success: true, notices: dbNotices });
      }
    } catch (e) {
      // Use in-memory store if DB query fails
    }
    res.json({ success: true, notices: initialNotices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new notice (Faculty action)
router.post('/', async (req, res) => {
  try {
    const { title, content, category, department, isUrgent, publishedBy, facultyRole } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const noticeData = {
      title,
      content,
      category: category || 'Academic',
      department: department || 'All Departments',
      isUrgent: !!isUrgent,
      publishedBy: publishedBy || 'Faculty Member',
      facultyRole: facultyRole || 'Faculty',
      createdAt: new Date().toISOString()
    };

    try {
      const createdNotice = await Notice.create(noticeData);
      return res.status(201).json({ success: true, notice: createdNotice });
    } catch (e) {
      // Fallback update in-memory
      const newNotice = { _id: 'n_' + Date.now(), ...noticeData };
      initialNotices.unshift(newNotice);
      return res.status(201).json({ success: true, notice: newNotice });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE notice (Faculty/Admin action)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await Notice.findByIdAndDelete(id);
    } catch (e) {
      // ignore DB delete failure
    }
    initialNotices = initialNotices.filter(n => n._id !== id);
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
