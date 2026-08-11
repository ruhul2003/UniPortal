import express from 'express';
import { ObjectId } from 'mongodb';
import { getFeedbackCollection } from '../config/db.js';

const router = express.Router();

// GET all feedback with optional query filters (facultyId, studentId, courseCode, department)
router.get('/', async (req, res) => {
  try {
    const feedbackCol = getFeedbackCollection();
    if (!feedbackCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const { facultyId, studentId, courseCode, department } = req.query;
    const query = {};

    if (facultyId) {
      if (ObjectId.isValid(facultyId)) {
        query.$or = [{ facultyId: facultyId }, { facultyId: new ObjectId(facultyId) }];
      } else {
        query.facultyId = facultyId;
      }
    }
    if (studentId) {
      query.studentId = studentId;
    }
    if (courseCode) {
      query.courseCode = { $regex: courseCode, $options: 'i' };
    }
    if (department && department !== 'all') {
      query.department = department;
    }

    const feedbackList = await feedbackCol.find(query).sort({ createdAt: -1 }).toArray();
    return res.json({ success: true, feedback: feedbackList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET aggregated feedback summary (analytics per faculty)
router.get('/summary', async (req, res) => {
  try {
    const feedbackCol = getFeedbackCollection();
    if (!feedbackCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const { facultyId } = req.query;
    const query = {};

    if (facultyId) {
      if (ObjectId.isValid(facultyId)) {
        query.$or = [{ facultyId: facultyId }, { facultyId: new ObjectId(facultyId) }];
      } else {
        query.facultyId = facultyId;
      }
    }

    const allFeedback = await feedbackCol.find(query).toArray();

    if (allFeedback.length === 0) {
      return res.json({
        success: true,
        summary: {
          totalReviews: 0,
          averageRating: 0,
          teachingQualityAvg: 0,
          courseContentAvg: 0,
          communicationAvg: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      });
    }

    const total = allFeedback.length;
    const sumRating = allFeedback.reduce((acc, f) => acc + (Number(f.rating) || 0), 0);
    const sumTeaching = allFeedback.reduce((acc, f) => acc + (Number(f.teachingQuality) || 5), 0);
    const sumContent = allFeedback.reduce((acc, f) => acc + (Number(f.courseContent) || 5), 0);
    const sumComm = allFeedback.reduce((acc, f) => acc + (Number(f.communication) || 5), 0);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allFeedback.forEach(f => {
      const r = Math.round(Number(f.rating) || 5);
      if (distribution[r] !== undefined) {
        distribution[r] += 1;
      }
    });

    const summary = {
      totalReviews: total,
      averageRating: parseFloat((sumRating / total).toFixed(1)),
      teachingQualityAvg: parseFloat((sumTeaching / total).toFixed(1)),
      courseContentAvg: parseFloat((sumContent / total).toFixed(1)),
      communicationAvg: parseFloat((sumComm / total).toFixed(1)),
      distribution
    };

    return res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit new teacher evaluation feedback
router.post('/', async (req, res) => {
  try {
    const {
      facultyId,
      facultyName,
      facultyEmail,
      department,
      courseCode,
      courseTitle,
      semester,
      rating,
      teachingQuality,
      courseContent,
      communication,
      comment,
      isAnonymous,
      studentId,
      studentName,
      studentEmail
    } = req.body;

    if (!facultyId || !facultyName || !courseCode || !courseTitle || !rating) {
      return res.status(400).json({
        error: 'Faculty member, course code, course title, and overall rating are required.'
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    const feedbackCol = getFeedbackCollection();
    if (!feedbackCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const isAnon = Boolean(isAnonymous);

    const newEntry = {
      studentId: isAnon ? '' : (studentId || 'STUDENT-ANON'),
      studentName: isAnon ? 'Anonymous Student' : (studentName || 'Student'),
      studentEmail: isAnon ? '' : (studentEmail || ''),
      facultyId: String(facultyId),
      facultyName: facultyName.trim(),
      facultyEmail: facultyEmail || '',
      department: department || 'Computer Science & Engineering',
      courseCode: courseCode.trim().toUpperCase(),
      courseTitle: courseTitle.trim(),
      semester: semester || 'Spring 2026',
      rating: numRating,
      teachingQuality: Math.min(5, Math.max(1, Number(teachingQuality) || 5)),
      courseContent: Math.min(5, Math.max(1, Number(courseContent) || 5)),
      communication: Math.min(5, Math.max(1, Number(communication) || 5)),
      comment: (comment || '').trim(),
      isAnonymous: isAnon,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await feedbackCol.insertOne(newEntry);
    const createdFeedback = { _id: result.insertedId, ...newEntry };

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your course teacher feedback has been submitted successfully.',
      feedback: createdFeedback
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE feedback entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const feedbackCol = getFeedbackCollection();
    if (!feedbackCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await feedbackCol.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Feedback review deleted successfully.' });
    }

    return res.status(404).json({ error: 'Feedback review not found in database.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
