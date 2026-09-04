import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb, getUsersCollection } from '../config/db.js';

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

// GET calculated attendance summary for a student or section
router.get('/summary', async (req, res) => {
  try {
    const col = getCol();
    const { studentId, studentName, section } = req.query;
    
    if (!col) {
      return res.json({ success: true, summary: [], studentSummaries: [] });
    }

    let query = {};
    if (section) query.section = section;

    const allSessions = await col.find(query).toArray();
    
    // 1. Course-level aggregation
    const courseStats = {};

    allSessions.forEach(session => {
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

      const records = session.records || [];

      if (studentId || studentName) {
        const rec = records.find(r => 
          (studentId && r.studentId === studentId) || 
          (studentName && r.studentName.toLowerCase() === studentName.toLowerCase())
        );
        if (rec) {
          courseStats[code].totalClasses += 1;
          if (rec.status === 'Present') courseStats[code].present += 1;
          else if (rec.status === 'Absent') courseStats[code].absent += 1;
          else if (rec.status === 'Late') courseStats[code].late += 1;
        }
      } else {
        // Aggregated stats for the section overall
        courseStats[code].totalClasses += 1;
        records.forEach(r => {
          if (r.status === 'Present') courseStats[code].present += 1;
          else if (r.status === 'Absent') courseStats[code].absent += 1;
          else if (r.status === 'Late') courseStats[code].late += 1;
        });
      }
    });

    const summaryList = Object.values(courseStats).map(stat => {
      const attended = stat.present + stat.late;
      const pct = stat.totalClasses > 0 ? Math.round((attended / (stat.present + stat.absent + stat.late || 1)) * 100) : 100;
      return {
        ...stat,
        percentage: pct,
        statusLabel: pct >= 80 ? 'Good' : pct >= 50 ? 'Average' : 'Low'
      };
    });

    // 2. Student-level aggregation for section view (Faculty & Admin)
    const studentMap = {};

    allSessions.forEach(session => {
      const records = session.records || [];
      records.forEach(r => {
        const sKey = r.studentId || r.studentName;
        if (!sKey) return;

        if (!studentMap[sKey]) {
          studentMap[sKey] = {
            studentId: r.studentId || 'N/A',
            studentName: r.studentName || 'Student',
            section: session.section || section || 'Section A',
            totalClasses: 0,
            present: 0,
            absent: 0,
            late: 0,
            percentage: 100,
            statusLabel: 'Good'
          };
        }

        studentMap[sKey].totalClasses += 1;
        if (r.status === 'Present') studentMap[sKey].present += 1;
        else if (r.status === 'Absent') studentMap[sKey].absent += 1;
        else if (r.status === 'Late') studentMap[sKey].late += 1;
      });
    });

    // Cross reference with users collection to include students with 0 session records
    try {
      const usersCol = getUsersCollection();
      if (usersCol && section) {
        const dbStudents = await usersCol.find({ role: 'student', section }).toArray();
        dbStudents.forEach(st => {
          const sKey = st.studentId || st._id.toString();
          const matchByName = Object.values(studentMap).find(s => s.studentName.toLowerCase() === st.name.toLowerCase());
          
          if (!studentMap[sKey] && !matchByName) {
            studentMap[sKey] = {
              studentId: st.studentId || st._id.toString(),
              studentName: st.name,
              section: st.section || section,
              totalClasses: 0,
              present: 0,
              absent: 0,
              late: 0,
              percentage: 100,
              statusLabel: 'Good'
            };
          }
        });
      }
    } catch (uErr) {
      console.warn('Failed to merge user collection students for attendance summary:', uErr.message);
    }

    const studentSummariesList = Object.values(studentMap).map(st => {
      const attended = st.present + st.late;
      const pct = st.totalClasses > 0 ? Math.round((attended / st.totalClasses) * 100) : 100;
      return {
        ...st,
        percentage: pct,
        statusLabel: pct >= 80 ? 'Good' : pct >= 50 ? 'Average' : 'Low'
      };
    });

    res.json({ 
      success: true, 
      summary: summaryList, 
      studentSummaries: studentSummariesList 
    });
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

// GET attendance risk assessment for a student
router.get('/risk-check', async (req, res) => {
  try {
    const col = getCol();
    const { studentId, section } = req.query;

    if (!col) {
      return res.json({
        success: true,
        overallPercentage: 100,
        isEligibleForAdmitCard: true,
        riskLevel: 'SAFE',
        courseRisks: []
      });
    }

    let query = {};
    if (section) query.section = section;

    const allSessions = await col.find(query).toArray();
    const courseStats = {};

    allSessions.forEach(session => {
      const code = session.courseCode;
      if (!courseStats[code]) {
        courseStats[code] = {
          courseCode: code,
          courseTitle: session.courseTitle || code,
          total: 0,
          attended: 0
        };
      }

      const records = session.records || [];
      const rec = records.find(r => (studentId && r.studentId === studentId));
      if (rec) {
        courseStats[code].total += 1;
        if (rec.status === 'Present' || rec.status === 'Late') {
          courseStats[code].attended += 1;
        }
      }
    });

    const courseRisks = Object.values(courseStats).map(c => {
      const pct = c.total > 0 ? Math.round((c.attended / c.total) * 100) : 100;
      const riskLevel = pct < 75 ? 'HIGH' : pct <= 80 ? 'MODERATE' : 'SAFE';
      return {
        ...c,
        percentage: pct,
        riskLevel,
        isBlocked: pct < 75
      };
    });

    const totalClasses = Object.values(courseStats).reduce((a, b) => a + b.total, 0);
    const totalAttended = Object.values(courseStats).reduce((a, b) => a + b.attended, 0);
    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100;
    const isEligibleForAdmitCard = overallPercentage >= 75;
    const overallRiskLevel = overallPercentage < 75 ? 'HIGH' : overallPercentage <= 80 ? 'MODERATE' : 'SAFE';

    res.json({
      success: true,
      overallPercentage,
      isEligibleForAdmitCard,
      riskLevel: overallRiskLevel,
      warningMessage: !isEligibleForAdmitCard 
        ? 'Warning: Your attendance is under 75%. You are at risk of exam permit disqualification.' 
        : 'Attendance criteria satisfied for exam permit eligibility.',
      courseRisks
    });
  } catch (error) {
    console.error('Error conducting attendance risk check:', error);
    res.status(500).json({ success: false, error: 'Failed to complete attendance risk check' });
  }
});

export default router;
