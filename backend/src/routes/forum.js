import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';

const router = express.Router();

function getCol() {
  const db = getDb();
  return db?.collection('forum_posts');
}

// GET all forum posts with search filter
router.get('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.json({ success: true, count: 0, posts: [] });

    const { courseCode, search } = req.query;
    let query = {};

    if (courseCode && courseCode !== 'All') {
      query.courseCode = courseCode;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await col.find(query).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch forum discussions' });
  }
});

// POST new forum question
router.post('/', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { title, content, courseCode, section, authorName, authorRole, authorAvatar, imageUrl } = req.body;

    if (!title || !content || !courseCode || !authorName) {
      return res.status(400).json({ success: false, error: 'Title, Content, Course Code, and Author Name are required' });
    }

    const newDoc = {
      title: title.trim(),
      content: content.trim(),
      courseCode: courseCode.trim(),
      section: section || 'All Sections',
      authorName: authorName.trim(),
      authorRole: authorRole || 'student',
      authorAvatar: authorAvatar || '',
      imageUrl: imageUrl || '',
      upvotes: [],
      isResolved: false,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await col.insertOne(newDoc);
    res.status(201).json({ success: true, message: 'Discussion post published', post: { _id: result.insertedId, ...newDoc } });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ success: false, error: 'Failed to publish post' });
  }
});

// POST upvote forum question
router.post('/:id/upvote', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const post = await col.findOne(filter);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Discussion post not found' });
    }

    let upvotes = post.upvotes || [];
    const hasUpvoted = upvotes.includes(userId);

    if (hasUpvoted) {
      upvotes = upvotes.filter(uId => uId !== userId);
    } else {
      upvotes.push(userId);
    }

    await col.updateOne(filter, { $set: { upvotes, updatedAt: new Date() } });
    const updated = await col.findOne(filter);

    res.json({ success: true, upvotes: upvotes.length, post: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upvote post' });
  }
});

// POST add comment / answer to post
router.post('/:id/comment', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { authorName, authorRole, authorAvatar, content, imageUrl } = req.body;

    if (!authorName || !content) {
      return res.status(400).json({ success: false, error: 'Author Name and Content are required' });
    }

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const post = await col.findOne(filter);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Discussion post not found' });
    }

    const newComment = {
      _id: new ObjectId().toString(),
      authorName: authorName.trim(),
      authorRole: authorRole || 'student',
      authorAvatar: authorAvatar || '',
      content: content.trim(),
      imageUrl: imageUrl || '',
      isVerifiedAnswer: authorRole === 'faculty',
      createdAt: new Date()
    };

    const comments = post.comments || [];
    comments.push(newComment);
    const isResolved = post.isResolved || newComment.isVerifiedAnswer;

    await col.updateOne(filter, { $set: { comments, isResolved, updatedAt: new Date() } });
    const updated = await col.findOne(filter);

    res.status(201).json({ success: true, message: 'Answer added successfully', post: updated });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, error: 'Failed to add answer' });
  }
});

// PATCH toggle "Instructor Verified Answer" status on a comment
router.patch('/:id/comments/:commentId/verify', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id, commentId } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const post = await col.findOne(filter);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Discussion post not found' });
    }

    const comments = post.comments || [];
    const commentIndex = comments.findIndex(c => c._id === commentId || c._id?.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    comments[commentIndex].isVerifiedAnswer = !comments[commentIndex].isVerifiedAnswer;
    const isResolved = comments.some(c => c.isVerifiedAnswer);

    await col.updateOne(filter, { $set: { comments, isResolved, updatedAt: new Date() } });
    const updated = await col.findOne(filter);

    res.json({ success: true, message: 'Verified answer status updated', post: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to verify comment' });
  }
});

// DELETE forum post
router.delete('/:id', async (req, res) => {
  try {
    const col = getCol();
    if (!col) return res.status(503).json({ success: false, error: 'Database unavailable' });

    const { id } = req.params;
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await col.deleteOne(filter);

    if (result.deletedCount > 0) {
      return res.json({ success: true, message: 'Discussion post deleted' });
    }
    res.status(404).json({ success: false, error: 'Discussion post not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
});

export default router;
