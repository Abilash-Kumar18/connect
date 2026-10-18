import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Serve static files from Vite build output
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Health check route for cloud deployment probes
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// SPA routing fallback: send index.html for any direct routes (/expenses, /channels/..., /profile)
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`CONNECT server running on port ${port} (http://0.0.0.0:${port})`);
});
