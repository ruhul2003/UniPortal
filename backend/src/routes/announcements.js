import express from 'express';
import { ObjectId } from 'mongodb';
import { getAnnouncementsCollection } from '../config/db.js';

const router = express.Router();

// GET announcements directly from MongoDB
router.get('/', async (req, res) => {
  try {
    const annCol = getAnnouncementsCollection();
    if (!annCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }
    const announcements = await annCol.find().sort({ isPinned: -1, createdAt: -1 }).toArray();
    return res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST announcement directly to MongoDB
router.post('/', async (req, res) => {
  try {
    const { title, description, tag, isPinned, publishedBy } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const annCol = getAnnouncementsCollection();
    if (!annCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const newAnnouncement = {
      title: title.trim(),
      description: description.trim(),
      tag: tag || 'General',
      isPinned: Boolean(isPinned),
      publishedBy: publishedBy || 'Department Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await annCol.insertOne(newAnnouncement);
    const createdItem = { _id: result.insertedId, ...newAnnouncement };

    return res.status(201).json({ 
      success: true, 
      message: 'Announcement posted successfully', 
      announcement: createdItem 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE announcement directly from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const annCol = getAnnouncementsCollection();
    if (!annCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await annCol.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Announcement deleted successfully' });
    }

    return res.status(404).json({ error: 'Announcement not found in database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
