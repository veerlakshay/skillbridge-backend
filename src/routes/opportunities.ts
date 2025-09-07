import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/opportunities - list all opportunities
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await prisma.opportunity.findMany({
      orderBy: { createdAt: 'desc' },
      include: { skills: true },
    });
    res.json(items);
    return;
  } catch (err) {
    next(err);
  }
});

// GET /api/opportunities/:id - get one opportunity
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await prisma.opportunity.findUnique({
      where: { id },
      include: { skills: true },
    });
    if (!item) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(item);
    return;
  } catch (err) {
    next(err);
  }
});

// POST /api/opportunities - create an opportunity
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, skillIds } = req.body as {
      title?: string;
      description?: string;
      skillIds?: string[];
    };
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }
    const connectSkills = (skillIds || []).map((id) => ({ id }));
    const created = await prisma.opportunity.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        skills: { connect: connectSkills },
      },
      include: { skills: true },
    });
    res.status(201).json(created);
    return;
  } catch (err) {
    next(err);
  }
});

// PUT /api/opportunities/:id - update an opportunity
router.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, skillIds } = req.body as {
      title?: string;
      description?: string;
      skillIds?: string[];
    };
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        title: title?.trim() ?? existing.title,
        description: description?.trim() ?? existing.description,
        ...(skillIds ? { skills: { set: skillIds.map((sid) => ({ id: sid })) } } : {}),
      },
      include: { skills: true },
    });
    res.json(updated);
    return;
  } catch (err) {
    next(err);
  }
});

// DELETE /api/opportunities/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.opportunity.delete({ where: { id } });
    res.status(204).send();
    return;
  } catch (err) {
    next(err);
  }
});

export default router;
