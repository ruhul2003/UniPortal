import express from 'express';
import { ObjectId } from 'mongodb';
import { getFeedbackCollection, getUsersCollection, getRoutinesCollection, getMarksCollection } from '../config/db.js';

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
      studentEmail,
      userRole,
      studentSection
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

    // 1. Role Verification: Faculty members cannot rate other faculty members
    let submitterRole = userRole || 'student';
    const usersCol = getUsersCollection();
    let submitterUser = null;

    if (usersCol) {
      if (studentEmail) {
        submitterUser = await usersCol.findOne({ email: studentEmail.trim() });
      } else if (studentId) {
        submitterUser = await usersCol.findOne({ studentId: studentId.trim() });
      }
    }

    if (submitterUser && submitterUser.role) {
      submitterRole = submitterUser.role;
    }

    if (submitterRole === 'faculty') {
      return res.status(403).json({
        success: false,
        error: 'Faculty members are not permitted to rate or evaluate other faculty members.'
      });
    }

    // 2. Subject Enrollment Verification: Only students of the faculty's subjects can rate
    const targetFacultyName = facultyName.trim();
    const cleanCourseCode = courseCode.trim().toUpperCase();

    const routinesCol = getRoutinesCollection();
    const marksCol = getMarksCollection();

    let isEnrolledInFacultySubject = false;

    // Check routines for matching faculty and courseCode
    if (routinesCol) {
      const routines = await routinesCol.find({
        courseCode: { $regex: cleanCourseCode, $options: 'i' }
      }).toArray();

      const matchingRoutineForFaculty = routines.find(r => 
        r.facultyName && (
          r.facultyName.toLowerCase().includes(targetFacultyName.toLowerCase()) ||
          targetFacultyName.toLowerCase().includes(r.facultyName.toLowerCase())
        )
      );

      if (matchingRoutineForFaculty) {
        const userSec = submitterUser?.section || studentSection || '';
        const userDept = submitterUser?.department || department || '';

        // If routine matches student's section or department, or student belongs to section taking the course
        if (
          !userSec ||
          matchingRoutineForFaculty.section === userSec ||
          matchingRoutineForFaculty.department === userDept ||
          routines.some(r => r.section === userSec)
        ) {
          isEnrolledInFacultySubject = true;
        }
      }
    }

    // Check marks collection if routine check was not sufficient
    if (!isEnrolledInFacultySubject && marksCol && (studentId || submitterUser?.studentId)) {
      const stId = submitterUser?.studentId || studentId;
      const markRecord = await marksCol.findOne({
        studentId: stId,
        courseCode: { $regex: cleanCourseCode, $options: 'i' }
      });
      if (markRecord) {
        isEnrolledInFacultySubject = true;
      }
    }

    // If routines exist for this faculty member, enforce that the student must be in their subject
    if (routinesCol) {
      const allRoutines = await routinesCol.find().toArray();
      const facultyTeachesInSystem = allRoutines.some(r => 
        r.facultyName && (
          r.facultyName.toLowerCase().includes(targetFacultyName.toLowerCase()) ||
          targetFacultyName.toLowerCase().includes(r.facultyName.toLowerCase())
        )
      );

      if (facultyTeachesInSystem && !isEnrolledInFacultySubject) {
        return res.status(403).json({
          success: false,
          error: `Only students enrolled in ${targetFacultyName}'s subjects can submit ratings for them.`
        });
      }
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
      facultyName: targetFacultyName,
      facultyEmail: facultyEmail || '',
      department: department || 'Computer Science & Engineering',
      courseCode: cleanCourseCode,
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
