
import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database file if it doesn't exist
const initDb = async () => {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ hospitals: [], visits: [] }));
  }
};

app.get('/api/data', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const { hospitals, visits } = req.body;
    await fs.writeFile(DB_PATH, JSON.stringify({ hospitals, visits }, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Node.js server running on http://localhost:${PORT}`);
  });
});
