const express = require('express');
const axios = require('axios');
const verifyToken = require('../middleware/verifyToken');
const asyncWrapper = require('../middleware/asyncWrapper');

const router = express.Router();
router.use(verifyToken);

router.post(
  '/enhance',
  asyncWrapper(async (req, res) => {
    const { title, description } = req.body;

    if ((!title || title.length < 3) && (!description || description.length < 3)) {
      return res.status(400).json({
        message: 'Title or description must be at least 3 characters.',
      });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is missing' });
    }

    const makePrompt = (type, input) => {
      if (type === 'title') {
        return [
          'You are an assistant for a task management app.',
          'Rewrite the task title to be concise, actionable, and human.',
          'Rules:',
          '- Keep it between 4 and 10 words.',
          '- Keep the original intent.',
          '- Use plain language.',
          '- Do NOT add quotes, bullets, labels, markdown, or explanations.',
          '- Return exactly one line: only the improved title.',
          `Input: "${input}"`,
        ].join('\n');
      }

      return [
        'You are an assistant for a task management app.',
        'Rewrite the task description so it is clear, practical, and easy to execute.',
        'Rules:',
        '- Keep the same intent and important details.',
        '- Use 2-5 short sentences.',
        '- Keep it concise and readable.',
        '- Do NOT add headings, labels, markdown, or explanations.',
        '- Return only the improved description text.',
        `Input: "${input}"`,
      ].join('\n');
    };

    const sanitizeOutput = (text, type) => {
      if (!text || typeof text !== 'string') return '';

      let cleaned = text.trim();
      cleaned = cleaned.replace(/^```[\s\S]*?\n/, '').replace(/```$/, '').trim();
      cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

      if (type === 'title') {
        cleaned = cleaned.split('\n').find((line) => line.trim()) || cleaned;
        cleaned = cleaned.replace(/^[-*]\s*/, '').trim();
        const words = cleaned.split(/\s+/).filter(Boolean);
        if (words.length > 10) cleaned = words.slice(0, 10).join(' ');
      }

      return cleaned;
    };

    const sendToGemini = async (text) => {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [{ text }],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            topP: 0.9,
            maxOutputTokens: 180,
          },
        }
      );
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    };

    const result = {};
    if (title && title.length >= 3) {
      const enhancedTitle = await sendToGemini(makePrompt('title', title));
      result.enhancedTitle = sanitizeOutput(enhancedTitle, 'title');
    }
    if (description && description.length >= 3) {
      const enhancedDescription = await sendToGemini(makePrompt('description', description));
      result.enhancedDescription = sanitizeOutput(enhancedDescription, 'description');
    }

    res.json(result);
  })
);

module.exports = router;
