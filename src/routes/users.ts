import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/users - list users
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({ include: { skills: true }, orderBy: { createdAt: 'desc' } });
    res.json(users);
    return;
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id - user details
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id }, include: { skills: true } });
    if (!user) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(user);
    return;
  } catch (err) {
    next(err);
  }
});

// POST /api/users - create user with skills
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, skillIds } = req.body as { name?: string; email?: string; skillIds?: string[] };
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }
    const created = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        skills: { connect: (skillIds || []).map((id) => ({ id })) },
      },
      include: { skills: true },
    });
    res.status(201).json(created);
    return;
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id/matches - opportunities ranked by skill overlap
router.get('/:id/matches', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id }, include: { skills: true } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const userSkillIds = new Set(user.skills.map((s) => s.id));

    const opportunities = await prisma.opportunity.findMany({ include: { skills: true } });
    const ranked = opportunities
      .map((opp) => {
        const overlap = opp.skills.filter((s) => userSkillIds.has(s.id)).length;
        return { ...opp, matchScore: overlap };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(ranked);
    return;
  } catch (err) {
    next(err);
  }
});

export default router;
