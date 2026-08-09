import express from 'express';
import { ObjectId } from 'mongodb';
import { getSectionRequestsCollection, getUsersCollection } from '../config/db.js';

const router = express.Router();

const SECTION_DEPARTMENT_MAP = {
  'Section A': 'Computer Science & Engineering',
  'Section B': 'Computer Science & Engineering',
  'Section C': 'Software Engineering',
  'Section D': 'Electrical & Electronic Engineering',
  'Section E': 'Information Technology'
};

// GET section change requests (optional ?userId=... filter)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const requestsCol = getSectionRequestsCollection();
    if (!requestsCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = userId ? { userId } : {};
    const requests = await requestsCol.find(filter).sort({ createdAt: -1 }).toArray();

    return res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new section change application
router.post('/', async (req, res) => {
  try {
    const { userId, userName, studentId, userEmail, currentSection, requestedSection, reason } = req.body;

    if (!userId || !requestedSection) {
      return res.status(400).json({ error: 'User ID and requested section are required' });
    }

    const requestsCol = getSectionRequestsCollection();
    if (!requestsCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    // Check if student already has a pending request
    const existingPending = await requestsCol.findOne({
      userId,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(400).json({
        error: 'You already have a pending section change request. Please wait for Admin review or cancel your existing application.'
      });
    }

    const newRequest = {
      userId,
      userName: userName || 'Student',
      studentId: studentId || 'N/A',
      userEmail: userEmail || '',
      currentSection: currentSection || 'Section A',
      requestedSection,
      reason: reason ? reason.trim() : 'Academic schedule conflict',
      status: 'pending', // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await requestsCol.insertOne(newRequest);
    const createdRequest = { _id: result.insertedId, ...newRequest };

    return res.status(201).json({
      success: true,
      message: 'Section transfer application submitted successfully',
      request: createdRequest
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH approve or cancel/reject section change request (Admin only action)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body; // status: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const requestsCol = getSectionRequestsCollection();
    const usersCol = getUsersCollection();
    if (!requestsCol || !usersCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const requestDoc = await requestsCol.findOne(filter);

    if (!requestDoc) {
      return res.status(404).json({ error: 'Section request not found' });
    }

    // Update request status
    await requestsCol.updateOne(filter, {
      $set: {
        status,
        adminComment: adminComment ? adminComment.trim() : '',
        reviewedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // If approved, update the student's section in users collection!
    if (status === 'approved') {
      const userFilter = ObjectId.isValid(requestDoc.userId)
        ? { _id: new ObjectId(requestDoc.userId) }
        : { _id: requestDoc.userId };

      const updateFields = {
        section: requestDoc.requestedSection,
        updatedAt: new Date()
      };

      if (SECTION_DEPARTMENT_MAP[requestDoc.requestedSection]) {
        updateFields.department = SECTION_DEPARTMENT_MAP[requestDoc.requestedSection];
      }

      await usersCol.updateOne(userFilter, { $set: updateFields });
    }

    const updatedRequest = await requestsCol.findOne(filter);

    return res.json({
      success: true,
      message: `Section change request ${status} successfully`,
      request: updatedRequest
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE cancel pending section request (Student)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requestsCol = getSectionRequestsCollection();
    if (!requestsCol) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await requestsCol.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Section request cancelled successfully' });
    }

    return res.status(404).json({ error: 'Section request not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
