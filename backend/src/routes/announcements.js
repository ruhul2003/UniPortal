import express from 'express';
import { Announcement } from '../models/Announcement.js';

const router = express.Router();

let initialAnnouncements = [
  {
    _id: 'a_1',
    title: 'Annual Tech Symposium & Hackathon 2026 Registration Open',
    description: 'We are excited to announce the annual UniPortal Hackathon! Register your team of up to 4 members by February 20th. Cash prizes up to $5,000 for top projects!',
    tag: 'Seminar',
    isPinned: true,
    publishedBy: 'Department of Computer Science',
    date: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    _id: 'a_2',
    title: 'Spring Festival Holiday Notice (Feb 21)',
    description: 'All academic and administrative activities will remain closed on February 21st in observance of International Mother Language Day.',
    tag: 'Holiday',
    isPinned: true,
    publishedBy: 'Registrar Office',
    date: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    _id: 'a_3',
    title: 'Guest Lecture on Cloud Computing Architecture & Microservices',
    description: 'Join us this Thursday at 3:00 PM in Main Auditorium for an insightful session by Senior Principal Engineer from AWS.',
    tag: 'Workshop',
    isPinned: false,
    publishedBy: 'Dr. Sarah Jenkins',
    date: new Date(Date.now() - 3600000 * 36).toISOString()
  }
];

// GET announcements
router.get('/', async (req, res) => {
  try {
    try {
      const dbItems = await Announcement.find().sort({ isPinned: -1, date: -1 });
      if (dbItems && dbItems.length > 0) {
        return res.json({ success: true, announcements: dbItems });
      }
    } catch (e) {}
    res.json({ success: true, announcements: initialAnnouncements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST announcement (Faculty/Admin action)
router.post('/', async (req, res) => {
  try {
    const { title, description, tag, isPinned, publishedBy } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const item = {
      title,
      description,
      tag: tag || 'General',
      isPinned: !!isPinned,
      publishedBy: publishedBy || 'Faculty Member',
      date: new Date().toISOString()
    };

    try {
      const created = await Announcement.create(item);
      return res.status(201).json({ success: true, announcement: created });
    } catch (e) {
      const newItem = { _id: 'a_' + Date.now(), ...item };
      initialAnnouncements.unshift(newItem);
      return res.status(201).json({ success: true, announcement: newItem });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE announcement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await Announcement.findByIdAndDelete(id);
    } catch (e) {}
    initialAnnouncements = initialAnnouncements.filter(a => a._id !== id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
