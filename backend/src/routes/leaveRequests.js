import express from 'express';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { getDb } from '../config/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

function getCol() {
  const db = getDb();
  return db?.collection('leaveRequests');
}

// GET /api/leave-requests
router.get('/', async (req, res) => {
  try {
    const { studentId, section, status } = req.query;
    let query = {};

    if (studentId) query.studentId = studentId;
    if (section && section !== 'All') query.section = section;
    if (status && status !== 'All') query.status = status;

    const col = getCol();
    if (col) {
      const requests = await col.find(query).sort({ createdAt: -1 }).toArray();
      return res.json({ success: true, requests });
    }

    const requests = await LeaveRequest.find(query).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave requests' });
  }
});

// POST /api/leave-requests - Submit new sick leave / absence request
router.post('/', async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      studentEmail,
      department,
      section,
      courseCode,
      startDate,
      endDate,
      reasonCategory,
      reason,
      documentUrl
    } = req.body;

    if (!studentId || !studentName || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: 'Missing required leave application fields' });
    }

    const newDoc = {
      studentId,
      studentName,
      studentEmail: studentEmail || '',
      department: department || 'Computer Science & Engineering',
      section: section || 'Section A',
      courseCode: courseCode || 'All Courses',
      startDate,
      endDate,
      reasonCategory: reasonCategory || 'Sick Leave',
      reason,
      documentUrl: documentUrl || '',
      status: 'Pending',
      facultyComment: '',
      reviewedBy: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const col = getCol();
    if (col) {
      const result = await col.insertOne(newDoc);
      return res.status(201).json({
        success: true,
        message: 'Leave application submitted successfully',
        request: { _id: result.insertedId, ...newDoc }
      });
    }

    const created = await LeaveRequest.create(newDoc);
    res.status(201).json({ success: true, message: 'Leave application submitted', request: created });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ success: false, error: 'Failed to submit leave request' });
  }
});

// PATCH /api/leave-requests/:id/status - Approve or Reject
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, facultyComment, reviewedBy } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Approved or Rejected' });
    }

    const updateFields = {
      status,
      facultyComment: facultyComment || '',
      reviewedBy: reviewedBy || 'Faculty',
      reviewedAt: new Date(),
      updatedAt: new Date()
    };

    const col = getCol();
    if (col) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
      await col.updateOne(filter, { $set: updateFields });
      const updated = await col.findOne(filter);
      return res.json({ success: true, message: `Leave application ${status.toLowerCase()}`, request: updated });
    }

    const updated = await LeaveRequest.findByIdAndUpdate(id, updateFields, { new: true });
    res.json({ success: true, message: `Leave application ${status.toLowerCase()}`, request: updated });
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ success: false, error: 'Failed to update leave request status' });
  }
});

// DELETE /api/leave-requests/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const col = getCol();
    if (col) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
      await col.deleteOne(filter);
      return res.json({ success: true, message: 'Leave request deleted' });
    }

    await LeaveRequest.findByIdAndDelete(id);
    res.json({ success: true, message: 'Leave request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete leave request' });
  }
});

export default router;
