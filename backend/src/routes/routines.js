import express from 'express';
import { ObjectId } from 'mongodb';
import { getRoutinesCollection } from '../config/db.js';

const router = express.Router();

// GET all routines directly from MongoDB
router.get('/', async (req, res) => {
  try {
    const routinesCol = getRoutinesCollection();
    if (!routinesCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }
    const routines = await routinesCol.find().toArray();
    return res.json({ success: true, routines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new routine slot directly to MongoDB
router.post('/', async (req, res) => {
  try {
    const { courseCode, courseTitle, day, startTime, endTime, room, building, department, semester, section, facultyName } = req.body;
    if (!courseCode || !courseTitle || !day || !startTime || !endTime) {
      return res.status(400).json({ error: 'Course code, title, day, start time, and end time are required' });
    }

    const routinesCol = getRoutinesCollection();
    if (!routinesCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const newRoutine = {
      courseCode: courseCode.trim(),
      courseTitle: courseTitle.trim(),
      day: day.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      room: room ? room.trim() : 'Lab 101',
      building: building ? building.trim() : 'Academic Building 1',
      department: department || 'Computer Science & Engineering',
      semester: semester || 'Spring 2026',
      section: section || 'Section A',
      facultyName: facultyName || 'Faculty Member',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await routinesCol.insertOne(newRoutine);
    const createdRoutine = { _id: result.insertedId, ...newRoutine };

    return res.status(201).json({ 
      success: true, 
      message: 'Routine slot added successfully', 
      routine: createdRoutine 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE routine slot directly from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const routinesCol = getRoutinesCollection();
    if (!routinesCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await routinesCol.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Routine slot deleted successfully' });
    }

    return res.status(404).json({ error: 'Routine slot not found in database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
