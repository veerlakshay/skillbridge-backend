import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/skills - list all skills
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    res.json(skills);
    return;
  } catch (err) {
    next(err);
  }
});

// POST /api/skills - create a new skill
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const skill = await prisma.skill.create({ data: { name: name.trim() } });
    res.status(201).json(skill);
    return;
  } catch (err) {
    next(err);
  }
});

export default router;
