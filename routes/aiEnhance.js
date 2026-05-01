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
          '- Keep it between 4 and 12 words.',
          '- Keep the original intent.',
          '- Use plain language.',
          '- Do NOT add quotes, bullets, labels, markdown, or explanations.',
          '- Return exactly one line: only the improved title.',
          `Input: "${input}"`,
        ].join('\n');
      }

      return [
        'You are an assistant for a task management app.',
        'Expand and rewrite the task description to be long, precise, and immediately useful for execution.',
        'Rules:',
        '- Preserve the original intent and constraints.',
        '- Write 6 to 12 full sentences.',
        '- Include: goal, scope, suggested steps, acceptance criteria, dependencies/risks if implied.',
        '- Use clear paragraphs or line breaks are allowed within the text (no markdown headings).',
        '- Do NOT add a preamble like "Here is" or "Sure".',
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
        if (words.length > 14) cleaned = words.slice(0, 14).join(' ');
      }

      return cleaned;
    };

    const sendToGemini = async (text, type) => {
      const isDescription = type === 'description';
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [{ text }],
            },
          ],
          generationConfig: {
            temperature: isDescription ? 0.45 : 0.35,
            topP: 0.9,
            maxOutputTokens: isDescription ? 2048 : 120,
          },
        }
      );
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    };

    const result = {};
    if (title && title.length >= 3) {
      const enhancedTitle = await sendToGemini(makePrompt('title', title), 'title');
      result.enhancedTitle = sanitizeOutput(enhancedTitle, 'title');
    }
    if (description && description.length >= 3) {
      const enhancedDescription = await sendToGemini(makePrompt('description', description), 'description');
      result.enhancedDescription = sanitizeOutput(enhancedDescription, 'description');
    }

    res.json(result);
  })
);

module.exports = router;
