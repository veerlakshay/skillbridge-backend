"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
// GET /api/users - list users
router.get('/', (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({ include: { skills: true }, orderBy: { createdAt: 'desc' } });
        res.json(users);
        return;
    }
    catch (err) {
        next(err);
    }
}));
// GET /api/users/:id - user details
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield prisma_1.default.user.findUnique({ where: { id }, include: { skills: true } });
        if (!user) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(user);
        return;
    }
    catch (err) {
        next(err);
    }
}));
// POST /api/users - create user with skills
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, skillIds } = req.body;
        if (!name || !email) {
            res.status(400).json({ error: 'Name and email are required' });
            return;
        }
        const created = yield prisma_1.default.user.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                skills: { connect: (skillIds || []).map((id) => ({ id })) },
            },
            include: { skills: true },
        });
        res.status(201).json(created);
        return;
    }
    catch (err) {
        next(err);
    }
}));
// GET /api/users/:id/matches - opportunities ranked by skill overlap
router.get('/:id/matches', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield prisma_1.default.user.findUnique({ where: { id }, include: { skills: true } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const userSkillIds = new Set(user.skills.map((s) => s.id));
        const opportunities = yield prisma_1.default.opportunity.findMany({ include: { skills: true } });
        const ranked = opportunities
            .map((opp) => {
            const overlap = opp.skills.filter((s) => userSkillIds.has(s.id)).length;
            return Object.assign(Object.assign({}, opp), { matchScore: overlap });
        })
            .sort((a, b) => b.matchScore - a.matchScore);
        res.json(ranked);
        return;
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
