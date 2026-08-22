import express from 'express';
import { PermitRequest } from '../models/PermitRequest.js';
import { User } from '../models/User.js';

const router = express.Router();

// GET /api/permits - Fetch permit applications
router.get('/', async (req, res) => {
  try {
    const { studentId, facultyId, role, email } = req.query;
    let query = {};

    if (studentId) {
      query.studentId = studentId;
    } else if (email && role === 'student') {
      query.studentEmail = email;
    } else if (facultyId) {
      query.facultyId = facultyId;
    } else if (email && role === 'faculty') {
      query.facultyEmail = email;
    }

    const permits = await PermitRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('student', 'name email studentId department section avatar dueAmount')
      .populate('faculty', 'name email facultyId acronym designation avatar');

    res.json({ success: true, permits });
  } catch (err) {
    console.error('Fetch permits error:', err);
    res.status(500).json({ error: 'Failed to fetch permit applications' });
  }
});

// POST /api/permits - Apply for a 1-day permit
router.post('/', async (req, res) => {
  try {
    const { studentId, facultyId, permitDate, reason } = req.body;

    if (!studentId || !facultyId || !permitDate || !reason) {
      return res.status(400).json({ error: 'Please provide all required fields (student, faculty, date, reason).' });
    }

    // Fetch student & faculty users
    const studentUser = await User.findOne({
      $or: [{ _id: studentId.match(/^[0-9a-fA-F]{24}$/) ? studentId : null }, { studentId: studentId }, { email: studentId }]
    });

    if (!studentUser) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const dueAmount = studentUser.dueAmount !== undefined ? studentUser.dueAmount : 28000;

    // Rule: Must have due payment > 25,000 Taka
    if (dueAmount <= 25000) {
      return res.status(400).json({
        error: `Ineligible: Your current due amount (৳${dueAmount.toLocaleString()} Taka) is ৳25,000 Taka or less. Only students with due payments over ৳25,000 Taka can apply for a 1-day permit.`
      });
    }

    const facultyUser = await User.findOne({
      $or: [{ _id: facultyId.match(/^[0-9a-fA-F]{24}$/) ? facultyId : null }, { facultyId: facultyId }, { email: facultyId }]
    });

    if (!facultyUser) {
      return res.status(404).json({ error: 'Faculty member not found.' });
    }

    // Generate Pass Code e.g. PERMIT-2026-X8K9
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const passCode = `PERMIT-2026-${randomCode}`;

    const newPermit = new PermitRequest({
      student: studentUser._id,
      studentId: studentUser.studentId || 'STUDENT',
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      department: studentUser.department || 'Computer Science & Engineering',
      section: studentUser.section || 'Section A',
      dueAmount: dueAmount,

      faculty: facultyUser._id,
      facultyId: facultyUser.facultyId || facultyUser.acronym || 'FACULTY',
      facultyName: facultyUser.name,
      facultyEmail: facultyUser.email,
      facultyAcronym: facultyUser.acronym || 'FAC',

      permitDate,
      reason,
      passCode,
      status: 'Pending'
    });

    await newPermit.save();

    res.status(201).json({
      success: true,
      message: 'Permit application submitted successfully!',
      permit: newPermit
    });
  } catch (err) {
    console.error('Create permit error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit permit application' });
  }
});

// PATCH /api/permits/:id/status - Approve or Cancel application by faculty
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, facultyComment } = req.body;

    if (!['Approved', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "Approved" or "Cancelled".' });
    }

    const permit = await PermitRequest.findById(id);
    if (!permit) {
      return res.status(404).json({ error: 'Permit request not found.' });
    }

    permit.status = status;
    if (facultyComment !== undefined) {
      permit.facultyComment = facultyComment;
    }

    if (status === 'Approved') {
      permit.approvedAt = new Date();
    } else if (status === 'Cancelled') {
      permit.cancelledAt = new Date();
    }

    await permit.save();

    res.json({
      success: true,
      message: `Permit application has been ${status.toLowerCase()}.`,
      permit
    });
  } catch (err) {
    console.error('Update permit status error:', err);
    res.status(500).json({ error: err.message || 'Failed to update permit status' });
  }
});

// DELETE /api/permits/:id - Cancel or remove permit request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PermitRequest.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Permit request not found.' });
    }

    res.json({ success: true, message: 'Permit application deleted successfully.' });
  } catch (err) {
    console.error('Delete permit error:', err);
    res.status(500).json({ error: 'Failed to delete permit application' });
  }
});

export default router;
