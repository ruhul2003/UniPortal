import express from 'express';
import { chatWithUniBot } from '../lib/ai.js';

const router = express.Router();

// POST /api/ai/chat - Universal AI Chat Assistant for UniPortal
router.post('/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid question or message string.' });
    }

    const aiResponse = await chatWithUniBot(message, history || [], context || {});
    res.json({
      success: true,
      reply: aiResponse.reply,
      isRealAI: aiResponse.isRealAI
    });
  } catch (err) {
    console.error('AI chat endpoint error:', err);
    res.status(500).json({ error: 'Failed to process AI chat query' });
  }
});

export default router;
