import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import skillsRouter from './routes/skills';
import opportunitiesRouter from './routes/opportunities';
import usersRouter from './routes/users';
import type { ErrorRequestHandler } from 'express';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.status(200).json({ message: 'SkillBridge API is running ✅' });
});

app.use('/api/skills', skillsRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/users', usersRouter);

// Simple error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  if ((err as any)?.code === 'P2002') {
    res.status(409).json({ error: 'Duplicate value' });
    return;
  }
  res.status(500).json({ error: 'Internal Server Error' });
};

app.use(errorHandler);

export default app;
