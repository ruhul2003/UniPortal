import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';

const router = express.Router();

function getCol() {
  const db = getDb();
  return db?.collection('resources');
}

// GET resources with search & category filters
router.get('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.json({ success: true, count: 0, resources: [] });

    const { category, courseCode, semester, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (courseCode) {
      query.courseCode = courseCode;
    }
    if (semester) {
      query.semester = semester;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { courseTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await col.find(query).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, count: resources.length, resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch study resources' });
  }
});

// POST upload new study resource
router.post('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { title, courseCode, courseTitle, semester, category, fileUrl, description, uploadedBy, uploadedByRole } = req.body;

    if (!title || !courseCode || !fileUrl || !uploadedBy) {
      return res.status(400).json({ success: false, error: 'Title, Course Code, File URL, and Uploader name are required' });
    }

    const newDoc = {
      title: title.trim(),
      courseCode: courseCode.trim(),
      courseTitle: (courseTitle || courseCode).trim(),
      semester: semester || 'Spring 2026',
      category: category || 'Class Notes',
      fileUrl: fileUrl.trim(),
      description: description || '',
      uploadedBy: uploadedBy.trim(),
      uploadedByRole: uploadedByRole || 'student',
      upvotes: [],
      downloadsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await col.insertOne(newDoc);
    res.status(201).json({ success: true, message: 'Resource shared successfully', resource: { _id: result.insertedId, ...newDoc } });
  } catch (error) {
    console.error('Error saving resource:', error);
    res.status(500).json({ success: false, error: 'Failed to share resource' });
  }
});

// POST upvote resource
router.post('/:id/upvote', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const resource = await col.findOne(filter);

    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    let upvotes = resource.upvotes || [];
    const hasUpvoted = upvotes.includes(userId);

    if (hasUpvoted) {
      upvotes = upvotes.filter(uId => uId !== userId);
    } else {
      upvotes.push(userId);
    }

    await col.updateOne(filter, { $set: { upvotes, updatedAt: new Date() } });
    const updated = await col.findOne(filter);

    res.json({ success: true, upvotes: upvotes.length, hasUpvoted: !hasUpvoted, resource: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upvote resource' });
  }
});

// POST increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    const result = await col.findOneAndUpdate(
      filter, 
      { $inc: { downloadsCount: 1 } }, 
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    res.json({ success: true, downloadsCount: result.downloadsCount });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update download count' });
  }
});

// DELETE resource
router.delete('/:id', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await col.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Resource deleted successfully' });
    }
    res.status(404).json({ success: false, error: 'Resource not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete resource' });
  }
});

export default router;
