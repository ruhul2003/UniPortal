import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';

const router = express.Router();

function getCol() {
  const db = getDb();
  return db?.collection('marks');
}

// Helper to calculate total, grade, and gpa
export function calculateGradeAndGPA(ct1 = 0, ct2 = 0, mid = 0, final = 0, assignment = 0, attendence = 0, ctRule = 'best') {
  const c1 = Number(ct1) || 0;
  const c2 = Number(ct2) || 0;
  const m = Number(mid) || 0;
  const f = Number(final) || 0;
  const a = Number(assignment) || 0;
  const att = Number(attendence) || 0;

  let effectiveCT = 0;
  if (ctRule === 'best') {
    effectiveCT = Math.max(c1, c2);
  } else if (ctRule === 'average') {
    effectiveCT = (c1 + c2) / 2;
  } else {
    // 'sum' or default
    effectiveCT = c1 + c2;
  }

  const total = Math.min(100, Math.max(0, Math.round((effectiveCT + m + f + a + att) * 100) / 100));

  let letterGrade = 'F';
  let gpa = 0.00;

  if (total >= 80) { letterGrade = 'A+'; gpa = 4.00; }
  else if (total >= 75) { letterGrade = 'A'; gpa = 3.75; }
  else if (total >= 70) { letterGrade = 'A-'; gpa = 3.50; }
  else if (total >= 65) { letterGrade = 'B+'; gpa = 3.25; }
  else if (total >= 60) { letterGrade = 'B'; gpa = 3.00; }
  else if (total >= 55) { letterGrade = 'B-'; gpa = 2.75; }
  else if (total >= 50) { letterGrade = 'C+'; gpa = 2.50; }
  else if (total >= 45) { letterGrade = 'C'; gpa = 2.25; }
  else if (total >= 40) { letterGrade = 'D'; gpa = 2.00; }
  else { letterGrade = 'F'; gpa = 0.00; }

  return { total, letterGrade, gpa, effectiveCT };
}

// GET /api/marks - Fetch marks list filtered by section, courseCode, studentId, or published
router.get('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.json({ success: true, count: 0, marks: [] });

    const { section, courseCode, studentId, published } = req.query;
    let query = {};

    if (section && section !== 'All') query.section = section;
    if (courseCode && courseCode !== 'All') query.courseCode = courseCode;
    if (studentId) query.studentId = studentId;
    if (published !== undefined && published !== '') {
      query.published = published === 'true';
    }

    const marks = await col.find(query).sort({ studentId: 1, courseCode: 1 }).toArray();
    res.json({ success: true, count: marks.length, marks });
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch marks records' });
  }
});

// GET /api/marks/student/:studentId - Fetch published marks for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.json({ success: true, count: 0, marks: [] });

    const { studentId } = req.params;
    const marks = await col.find({ studentId, published: true }).sort({ courseCode: 1 }).toArray();

    res.json({ success: true, count: marks.length, marks });
  } catch (error) {
    console.error('Error fetching student marks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch student marks' });
  }
});

// POST /api/marks - Save or update single or batch student marks
router.post('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const payload = req.body;
    const records = Array.isArray(payload) ? payload : [payload];

    const results = [];
    for (const item of records) {
      const {
        _id,
        studentId,
        studentName,
        studentEmail,
        courseCode,
        courseTitle,
        section,
        semester,
        ct1 = 0,
        ct2 = 0,
        mid = 0,
        final = 0,
        assignment = 0,
        attendence = 0,
        ctRule = 'best',
        published = false,
        publishedBy = 'Faculty',
        remarks = ''
      } = item;

      if (!studentId || !courseCode) {
        continue;
      }

      const { total, letterGrade, gpa, effectiveCT } = calculateGradeAndGPA(ct1, ct2, mid, final, assignment, attendence, ctRule);

      const docToSave = {
        studentId: studentId.trim(),
        studentName: (studentName || 'Student').trim(),
        studentEmail: (studentEmail || '').trim(),
        courseCode: courseCode.trim(),
        courseTitle: (courseTitle || courseCode).trim(),
        section: section || 'Section A',
        semester: semester || 'Spring 2026',
        ct1: Number(ct1) || 0,
        ct2: Number(ct2) || 0,
        mid: Number(mid) || 0,
        final: Number(final) || 0,
        assignment: Number(assignment) || 0,
        attendence: Number(attendence) || 0,
        ctRule: ctRule || 'best',
        effectiveCT,
        totalMarks: total,
        letterGrade,
        gpa,
        published: Boolean(published),
        publishedBy: publishedBy || 'Faculty',
        remarks: remarks || '',
        updatedAt: new Date()
      };

      if (_id && ObjectId.isValid(_id)) {
        await col.updateOne({ _id: new ObjectId(_id) }, { $set: docToSave });
        results.push({ ...docToSave, _id });
      } else {
        // Upsert based on studentId + courseCode
        const existing = await col.findOne({ studentId: docToSave.studentId, courseCode: docToSave.courseCode });
        if (existing) {
          await col.updateOne({ _id: existing._id }, { $set: docToSave });
          results.push({ ...docToSave, _id: existing._id });
        } else {
          docToSave.createdAt = new Date();
          const insertRes = await col.insertOne(docToSave);
          results.push({ ...docToSave, _id: insertRes.insertedId });
        }
      }
    }

    res.json({ success: true, message: 'Marks saved successfully', count: results.length, marks: results });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ success: false, error: 'Failed to save marks' });
  }
});

// POST /api/marks/update-rule - Bulk update CT calculation rule for section/course
router.post('/update-rule', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { courseCode, section, ctRule = 'best' } = req.body;

    let filter = {};
    if (courseCode && courseCode !== 'All') filter.courseCode = courseCode;
    if (section && section !== 'All') filter.section = section;

    const records = await col.find(filter).toArray();
    let modifiedCount = 0;

    for (const doc of records) {
      const { ct1 = 0, ct2 = 0, mid = 0, final = 0, assignment = 0, attendence = 0 } = doc;
      const { total, letterGrade, gpa, effectiveCT } = calculateGradeAndGPA(ct1, ct2, mid, final, assignment, attendence, ctRule);

      await col.updateOne(
        { _id: doc._id },
        {
          $set: {
            ctRule,
            effectiveCT,
            totalMarks: total,
            letterGrade,
            gpa,
            updatedAt: new Date()
          }
        }
      );
      modifiedCount++;
    }

    res.json({
      success: true,
      message: `CT Rule updated to '${ctRule}' for ${modifiedCount} student records`,
      modifiedCount
    });
  } catch (error) {
    console.error('Error updating CT rule:', error);
    res.status(500).json({ success: false, error: 'Failed to update CT calculation rule' });
  }
});

// POST /api/marks/bulk-publish - Publish/Unpublish all marks for course & section
router.post('/bulk-publish', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { courseCode, section, published = true, publishedBy = 'Faculty' } = req.body;

    let filter = {};
    if (courseCode && courseCode !== 'All') filter.courseCode = courseCode;
    if (section && section !== 'All') filter.section = section;

    const result = await col.updateMany(
      filter,
      { 
        $set: { 
          published: Boolean(published),
          publishedBy,
          updatedAt: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: `Marks ${published ? 'published' : 'unpublished'} successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk publishing marks:', error);
    res.status(500).json({ success: false, error: 'Failed to update publication status' });
  }
});

// PUT /api/marks/:id - Update single mark record
router.put('/:id', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    const { ct1 = 0, ct2 = 0, mid = 0, final = 0, assignment = 0, attendence = 0, ctRule = 'best', published, remarks } = req.body;
    const { total, letterGrade, gpa, effectiveCT } = calculateGradeAndGPA(ct1, ct2, mid, final, assignment, attendence, ctRule);

    const updateFields = {
      ct1: Number(ct1) || 0,
      ct2: Number(ct2) || 0,
      mid: Number(mid) || 0,
      final: Number(final) || 0,
      assignment: Number(assignment) || 0,
      attendence: Number(attendence) || 0,
      ctRule: ctRule || 'best',
      effectiveCT,
      totalMarks: total,
      letterGrade,
      gpa,
      updatedAt: new Date()
    };

    if (published !== undefined) updateFields.published = Boolean(published);
    if (remarks !== undefined) updateFields.remarks = remarks;

    await col.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    res.json({ success: true, message: 'Mark entry updated successfully' });
  } catch (error) {
    console.error('Error updating mark record:', error);
    res.status(500).json({ success: false, error: 'Failed to update mark record' });
  }
});

// DELETE /api/marks/:id - Delete mark entry
router.delete('/:id', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    await col.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: 'Mark record deleted successfully' });
  } catch (error) {
    console.error('Error deleting mark record:', error);
    res.status(500).json({ success: false, error: 'Failed to delete mark record' });
  }
});

export default router;
