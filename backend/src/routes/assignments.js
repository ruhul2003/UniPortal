import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';

const router = express.Router();

function getCol() {
  const db = getDb();
  return db?.collection('assignments');
}

// GET all assignments
router.get('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.json({ success: true, count: 0, assignments: [] });

    const { section } = req.query;
    let query = {};
    if (section && section !== 'All') {
      query.section = { $in: [section, 'Section A', 'All'] };
    }

    const assignments = await col.find(query).sort({ dueDate: 1 }).toArray();
    res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

// POST create assignment
router.post('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { title, courseCode, courseTitle, section, description, dueDate, totalPoints, attachmentUrl, createdBy, createdByRole } = req.body;

    if (!title || !courseCode || !dueDate || !createdBy) {
      return res.status(400).json({ success: false, error: 'Missing required assignment fields' });
    }

    const newDoc = {
      title: title.trim(),
      courseCode: courseCode.trim(),
      courseTitle: (courseTitle || courseCode).trim(),
      section: section || 'Section A',
      description: description || '',
      dueDate: new Date(dueDate),
      totalPoints: Number(totalPoints) || 100,
      attachmentUrl: attachmentUrl || '',
      createdBy: createdBy.trim(),
      createdByRole: createdByRole || 'cr',
      submissions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await col.insertOne(newDoc);
    res.status(201).json({ success: true, message: 'Assignment created successfully', assignment: { _id: result.insertedId, ...newDoc } });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to create assignment' });
  }
});

// POST submit solution for assignment
router.post('/:id/submit', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { studentId, studentName, submissionUrl, notes } = req.body;
    if (!studentId || !studentName || !submissionUrl) {
      return res.status(400).json({ success: false, error: 'Student ID, Name, and Submission URL are required' });
    }

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const assignment = await col.findOne(filter);

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const submissions = assignment.submissions || [];
    const existingIndex = submissions.findIndex(s => s.studentId === studentId);

    const submissionDoc = {
      studentId,
      studentName,
      submissionUrl,
      notes: notes || '',
      submittedAt: new Date(),
      grade: 'Submitted'
    };

    if (existingIndex > -1) {
      submissions[existingIndex] = submissionDoc;
    } else {
      submissions.push(submissionDoc);
    }

    await col.updateOne(filter, { $set: { submissions, updatedAt: new Date() } });
    const updatedAssignment = await col.findOne(filter);

    res.json({ success: true, message: 'Assignment submitted successfully', assignment: updatedAssignment });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ success: false, error: 'Failed to submit assignment' });
  }
});

// DELETE assignment
router.delete('/:id', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await col.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Assignment deleted successfully' });
    }
    res.status(404).json({ success: false, error: 'Assignment not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete assignment' });
  }
});

export default router;
