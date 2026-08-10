import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';

const router = express.Router();

function getCol() {
  const db = getDb();
  return db?.collection('attendance');
}

// GET all attendance sessions or filter by section/course/date
router.get('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) {
      return res.json({ success: true, count: 0, sessions: [] });
    }

    const { section, courseCode, date } = req.query;
    let query = {};
    if (section) query.section = section;
    if (courseCode) query.courseCode = courseCode;
    if (date) query.date = date;

    const sessions = await col.find(query).sort({ date: -1, createdAt: -1 }).toArray();
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attendance records' });
  }
});

// GET calculated attendance summary for a student
router.get('/summary', async (req, res) => {
  try {
    const col = getCol();
    const { studentId, studentName, section } = req.query;
    
    if (!col) {
      return res.json({ success: true, summary: [] });
    }

    let query = {};
    if (section) query.section = section;

    const allSessions = await col.find(query).toArray();
    
    // Aggregate metrics per courseCode
    const courseStats = {};

    allSessions.forEach(session => {
      const records = session.records || [];
      const rec = records.find(r => 
        (studentId && r.studentId === studentId) || 
        (studentName && r.studentName.toLowerCase() === studentName.toLowerCase())
      );

      if (rec) {
        const code = session.courseCode;
        if (!courseStats[code]) {
          courseStats[code] = {
            courseCode: code,
            courseTitle: session.courseTitle || code,
            totalClasses: 0,
            present: 0,
            absent: 0,
            late: 0,
            percentage: 100
          };
        }

        courseStats[code].totalClasses += 1;
        if (rec.status === 'Present') courseStats[code].present += 1;
        else if (rec.status === 'Absent') courseStats[code].absent += 1;
        else if (rec.status === 'Late') courseStats[code].late += 1;
      }
    });

    const summaryList = Object.values(courseStats).map(stat => {
      const attended = stat.present + stat.late;
      const pct = stat.totalClasses > 0 ? Math.round((attended / stat.totalClasses) * 100) : 100;
      return {
        ...stat,
        percentage: pct,
        statusLabel: pct >= 75 ? 'Safe' : pct >= 70 ? 'Warning' : 'Danger'
      };
    });

    res.json({ success: true, summary: summaryList });
  } catch (error) {
    console.error('Error computing attendance summary:', error);
    res.status(500).json({ success: false, error: 'Failed to compute attendance summary' });
  }
});

// POST mark/save attendance session
router.post('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }

    const { courseCode, courseTitle, section, date, timeSlot, markedBy, markedByRole, records } = req.body;

    if (!courseCode || !section || !date || !markedBy || !records) {
      return res.status(400).json({ success: false, error: 'Missing required attendance fields' });
    }

    const filter = { courseCode, section, date };
    const update = {
      $set: {
        courseCode,
        courseTitle: courseTitle || courseCode,
        section,
        date,
        timeSlot: timeSlot || '',
        markedBy,
        markedByRole: markedByRole || 'faculty',
        records,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };

    const result = await col.updateOne(filter, update, { upsert: true });
    const session = await col.findOne(filter);

    res.status(201).json({ success: true, message: 'Attendance recorded successfully', session });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ success: false, error: 'Failed to record attendance' });
  }
});

// DELETE an attendance session
router.delete('/:id', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await col.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Attendance session deleted' });
    }
    res.status(404).json({ success: false, error: 'Attendance session not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete attendance session' });
  }
});

export default router;
