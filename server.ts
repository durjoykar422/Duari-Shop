import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json());

  // Setup Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Search grounding API endpoint for product inquiries, live prices, reviews & tech specs
  app.post('/api/ai-search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      if (!ai) {
        res.json({
          text: `Here is information about "${query}": Duari Shop offers high quality tech gadgets, gaming consoles like the J36 Ultra, audio gear, and home essentials with verified doorstep delivery across Bangladesh.`,
          groundingChunks: [],
          isFallback: true,
        });
        return;
      }

      // Use search grounding as requested
      // We will try gemini-3.5-flash or fallback to gemini-3.8-flash
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `The user is shopping on Duari Shop (an e-commerce platform in Bangladesh). Answer the query concisely with real-time specs, prices, or product advice: "${query}". Keep response under 120 words.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
      } catch (err) {
        // Fallback to gemini-3.8-flash if 3.5 is not available
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `The user is shopping on Duari Shop (an e-commerce platform in Bangladesh). Answer the query concisely with real-time specs, prices, or product advice: "${query}". Keep response under 120 words.`,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
      }

      const text = response.text || '';
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        text,
        groundingChunks: chunks,
      });
    } catch (error: any) {
      console.error('Gemini search error:', error);
      res.status(500).json({
        error: error.message || 'Failed to complete search with grounding',
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Setup Vite middlewares for development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Duari Shop server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
