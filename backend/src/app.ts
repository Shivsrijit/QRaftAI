import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { 
  createAssignment, 
  getAssignments, 
  getAssignmentById, 
  regenerateAssignment,
  deleteAssignment,
  downloadAssignmentPDF,
  updateAssignmentLifecycleStatus
} from './controllers/assignment.controller';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json());

// Ensure the static PDFs public directory exists
const pdfsDir = path.join(__dirname, '../public/pdfs');
fs.mkdirSync(pdfsDir, { recursive: true });

// Serve static PDF outputs without browser caching
app.use('/pdfs', express.static(path.join(__dirname, '../public/pdfs'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
}));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'VedaAI Assessment Creator API' });
});

// RESTful Core API Endpoints
app.post('/api/assignments', createAssignment);
app.get('/api/assignments', getAssignments);
app.get('/api/assignments/:id', getAssignmentById);
app.get('/api/assignments/:id/download', downloadAssignmentPDF);
app.post('/api/assignments/:id/regenerate', regenerateAssignment);
app.delete('/api/assignments/:id', deleteAssignment);
app.patch('/api/assignments/:id/status', updateAssignmentLifecycleStatus);

export default app;
