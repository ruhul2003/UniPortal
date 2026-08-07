import express from 'express';
import { ObjectId } from 'mongodb';
import { getNoticesCollection } from '../config/db.js';

const router = express.Router();

// GET all notices directly from MongoDB
router.get('/', async (req, res) => {
  try {
    const noticesCol = getNoticesCollection();
    if (!noticesCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }
    const notices = await noticesCol.find().sort({ createdAt: -1 }).toArray();
    return res.json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new notice directly to MongoDB
router.post('/', async (req, res) => {
  try {
    const { title, content, category, department, isUrgent, publishedBy, facultyRole } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const noticesCol = getNoticesCollection();
    if (!noticesCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const newNotice = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      department: department || 'All Departments',
      isUrgent: Boolean(isUrgent),
      publishedBy: publishedBy || 'Faculty Member',
      facultyRole: facultyRole || 'Academic Faculty',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await noticesCol.insertOne(newNotice);
    const createdNotice = { _id: result.insertedId, ...newNotice };

    return res.status(201).json({ 
      success: true, 
      message: 'Notice published successfully', 
      notice: createdNotice 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE notice directly from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const noticesCol = getNoticesCollection();
    if (!noticesCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await noticesCol.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Notice deleted successfully' });
    }

    return res.status(404).json({ error: 'Notice not found in database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
