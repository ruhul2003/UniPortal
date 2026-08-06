import express from 'express';
import { ObjectId } from 'mongodb';
import { getAnnouncementsCollection } from '../config/db.js';

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

// GET announcements (Native MongoDB Driver)
router.get('/', async (req, res) => {
  try {
    try {
      const annCol = getAnnouncementsCollection();
      if (annCol) {
        const dbItems = await annCol.find().sort({ isPinned: -1, createdAt: -1 }).toArray();
        return res.json({ success: true, announcements: dbItems });
      }
    } catch (e) {
      console.warn('[Announcement DB Fetch Fallback]', e.message);
    }
    return res.json({ success: true, announcements: initialAnnouncements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST announcement (Native MongoDB Driver)
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
      date: new Date().toISOString(),
      createdAt: new Date()
    };

    try {
      const annCol = getAnnouncementsCollection();
      if (annCol) {
        const result = await annCol.insertOne(item);
        const created = { _id: result.insertedId, ...item };
        return res.status(201).json({ success: true, announcement: created });
      }
    } catch (e) {
      console.warn('[Announcement Post DB Fallback]', e.message);
    }

    const newItem = { _id: 'a_' + Date.now(), ...item };
    initialAnnouncements.unshift(newItem);
    return res.status(201).json({ success: true, announcement: newItem });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE announcement (Native MongoDB Driver)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const annCol = getAnnouncementsCollection();
      if (annCol) {
        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
        await annCol.deleteOne(filter);
      }
    } catch (e) {}
    initialAnnouncements = initialAnnouncements.filter(a => a._id !== id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
