// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import bettingRoutes from './routes/betting.js';
import glazeRoutes from './routes/glaze.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from main.env in project root, fallback to .env
const projectRoot = join(__dirname, '..');
dotenv.config({ path: join(projectRoot, 'main.env') });
dotenv.config({ path: join(__dirname, '.env') }); // Fallback to backend/.env if it exists
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/api/betting', bettingRoutes);
app.use('/glaze', glazeRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
