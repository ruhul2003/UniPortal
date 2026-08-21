import express from 'express';
import { ObjectId } from 'mongodb';
import { getExamsCollection, getUsersCollection } from '../config/db.js';

const router = express.Router();

// Helper to get exams collection safely
function getCol() {
  return getExamsCollection();
}

// GET /api/exams - Fetch all exams, with optional section & examType filter
router.get('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) {
      return res.status(503).json({ success: false, error: 'Database connection unavailable' });
    }

    const { section, examType, semester } = req.query;
    let filter = {};

    if (section && section !== 'All') {
      filter.section = section;
    }
    if (examType && examType !== 'All') {
      filter.examType = examType;
    }
    if (semester && semester !== 'All') {
      filter.semester = semester;
    }

    const exams = await col.find(filter).sort({ examDate: 1, startTime: 1 }).toArray();
    return res.json({ success: true, count: exams.length, exams });
  } catch (err) {
    console.error('Error fetching exams:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch exam schedules' });
  }
});

// GET /api/exams/admit-card - Generate personalized admit card metadata for a student
router.get('/admit-card', async (req, res) => {
  try {
    const { studentId, email } = req.query;
    const usersCol = getUsersCollection();
    const examsCol = getCol();

    if (!usersCol || !examsCol) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }

    let user = null;
    if (studentId) {
      user = await usersCol.findOne({ studentId: studentId.trim() });
    } else if (email) {
      user = await usersCol.findOne({ email: email.trim() });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'Student not found in database' });
    }

    const section = user.section || 'Section A';
    // Fetch exams matching student section or general exams
    const studentExams = await examsCol.find({
      $or: [
        { section: section },
        { section: 'All' }
      ]
    }).sort({ examDate: 1, startTime: 1 }).toArray();

    const admitCard = {
      studentName: user.name,
      studentId: user.studentId || 'N/A',
      email: user.email,
      department: user.department || 'Computer Science & Engineering',
      section: user.section || 'Section A',
      avatar: user.avatar || '',
      semester: 'Spring 2026',
      issueDate: new Date().toISOString().split('T')[0],
      verificationCode: `MPU-${(user.studentId || 'STUDENT').replace(/[^a-zA-Z0-9]/g, '')}-2026`,
      exams: studentExams
    };

    return res.json({ success: true, admitCard });
  } catch (err) {
    console.error('Error generating admit card:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate admit card' });
  }
});

// POST /api/exams - Create a new exam schedule entry
router.post('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const {
      courseCode,
      courseTitle,
      examType = 'Midterm Exam',
      semester = 'Spring 2026',
      section = 'Section A',
      department = 'Computer Science & Engineering',
      examDate,
      startTime,
      endTime,
      room,
      building = 'Academic Building 1',
      invigilator = 'Faculty Member',
      instructions = 'Bring official Student ID card.',
      publishedBy = 'Faculty'
    } = req.body;

    if (!courseCode || !courseTitle || !examDate || !startTime || !endTime || !room) {
      return res.status(400).json({ success: false, error: 'Course code, title, date, times, and room are required.' });
    }

    const newExam = {
      courseCode: courseCode.trim(),
      courseTitle: courseTitle.trim(),
      examType: examType.trim(),
      semester: semester.trim(),
      section: section.trim(),
      department: department.trim(),
      examDate: examDate.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      room: room.trim(),
      building: building.trim(),
      invigilator: invigilator.trim(),
      instructions: instructions.trim(),
      publishedBy: publishedBy.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await col.insertOne(newExam);
    return res.status(201).json({
      success: true,
      message: 'Exam schedule published successfully',
      exam: { _id: result.insertedId, ...newExam }
    });
  } catch (err) {
    console.error('Error creating exam:', err);
    return res.status(500).json({ success: false, error: 'Failed to create exam schedule' });
  }
});

// PUT /api/exams/:id - Update an exam entry
router.put('/:id', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    const updateFields = { ...req.body, updatedAt: new Date() };
    delete updateFields._id;

    await col.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    return res.json({ success: true, message: 'Exam schedule updated successfully' });
  } catch (err) {
    console.error('Error updating exam:', err);
    return res.status(500).json({ success: false, error: 'Failed to update exam' });
  }
});

// DELETE /api/exams/:id - Delete an exam entry
router.delete('/:id', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    const result = await col.deleteOne(filter);
    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Exam schedule deleted successfully' });
    }

    return res.status(404).json({ success: false, error: 'Exam entry not found' });
  } catch (err) {
    console.error('Error deleting exam:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete exam' });
  }
});

export default router;
