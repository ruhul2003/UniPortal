import express from 'express';
import { DocumentRequest } from '../models/DocumentRequest.js';
import { User } from '../models/User.js';

const router = express.Router();

// GET /api/document-requests - Fetch document request applications
router.get('/', async (req, res) => {
  try {
    const { studentId, status } = req.query;
    let query = {};

    if (studentId) {
      query.studentId = studentId;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    const requests = await DocumentRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('student', 'name email studentId department section avatar');

    res.json({ success: true, requests });
  } catch (err) {
    console.error('Fetch document requests error:', err);
    res.status(500).json({ error: 'Failed to fetch document requests' });
  }
});

// GET /api/document-requests/verify/:code - Verify document tracking code
router.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const request = await DocumentRequest.findOne({ trackingCode: code.toUpperCase() })
      .populate('student', 'name email studentId department section avatar');

    if (!request) {
      return res.status(404).json({ success: false, error: 'Document verification failed. Invalid tracking code.' });
    }

    res.json({ success: true, verified: true, request });
  } catch (err) {
    console.error('Verify document code error:', err);
    res.status(500).json({ error: 'Failed to verify document code' });
  }
});

// GET /api/document-requests/stats - Get analytics summary counts
router.get('/stats', async (req, res) => {
  try {
    const total = await DocumentRequest.countDocuments();
    const pending = await DocumentRequest.countDocuments({ status: 'Pending' });
    const inProcessing = await DocumentRequest.countDocuments({ status: 'In Processing' });
    const approved = await DocumentRequest.countDocuments({ status: 'Approved' });
    const rejected = await DocumentRequest.countDocuments({ status: 'Rejected' });

    res.json({
      success: true,
      stats: { total, pending, inProcessing, approved, rejected }
    });
  } catch (err) {
    console.error('Fetch document stats error:', err);
    res.status(500).json({ error: 'Failed to fetch document request statistics' });
  }
});

// POST /api/document-requests - Submit a new document request
router.post('/', async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      studentEmail,
      department,
      section,
      documentType,
      purpose,
      deliveryMode,
      isUrgent,
      reason
    } = req.body;

    if (!studentId || !documentType || !purpose) {
      return res.status(400).json({ error: 'Please provide all required fields (studentId, documentType, purpose).' });
    }

    // Generate unique tracking code e.g. DOC-2026-X89B
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const trackingCode = `DOC-2026-${randomCode}`;

    // Optionally attach student user reference
    let studentUser = null;
    if (studentId) {
      studentUser = await User.findOne({
        $or: [
          { studentId: studentId },
          { email: studentEmail || studentId },
          { _id: studentId.match(/^[0-9a-fA-F]{24}$/) ? studentId : null }
        ]
      });
    }

    const newRequest = new DocumentRequest({
      student: studentUser ? studentUser._id : null,
      studentId: studentUser ? (studentUser.studentId || studentId) : studentId,
      studentName: studentName || (studentUser ? studentUser.name : 'Student'),
      studentEmail: studentEmail || (studentUser ? studentUser.email : ''),
      department: department || (studentUser ? studentUser.department : 'Computer Science & Engineering'),
      section: section || (studentUser ? studentUser.section : 'Section A'),
      documentType,
      purpose,
      deliveryMode: deliveryMode || 'Digital PDF Download',
      isUrgent: Boolean(isUrgent),
      reason: reason || '',
      trackingCode,
      status: 'Pending'
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Academic document request submitted successfully!',
      request: newRequest
    });
  } catch (err) {
    console.error('Create document request error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit document request' });
  }
});

// PATCH /api/document-requests/:id/status - Update application status by admin/faculty
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks, reviewedBy } = req.body;

    if (!['Pending', 'In Processing', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const docReq = await DocumentRequest.findById(id);
    if (!docReq) {
      return res.status(404).json({ error: 'Document request not found.' });
    }

    docReq.status = status;
    if (adminRemarks !== undefined) {
      docReq.adminRemarks = adminRemarks;
    }
    if (reviewedBy !== undefined) {
      docReq.reviewedBy = reviewedBy;
    }

    if (status === 'Approved') {
      docReq.approvedAt = new Date();
    } else if (status === 'Rejected') {
      docReq.rejectedAt = new Date();
    }

    await docReq.save();

    res.json({
      success: true,
      message: `Document request status updated to ${status}.`,
      request: docReq
    });
  } catch (err) {
    console.error('Update document request status error:', err);
    res.status(500).json({ error: err.message || 'Failed to update document request' });
  }
});

// DELETE /api/document-requests/:id - Retract/Delete document request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DocumentRequest.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Document request not found.' });
    }

    res.json({ success: true, message: 'Document application retracted successfully.' });
  } catch (err) {
    console.error('Delete document request error:', err);
    res.status(500).json({ error: 'Failed to delete document request' });
  }
});

export default router;
