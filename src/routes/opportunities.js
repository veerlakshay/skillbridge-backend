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
// GET /api/opportunities - list all opportunities
router.get('/', (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prisma_1.default.opportunity.findMany({
            orderBy: { createdAt: 'desc' },
            include: { skills: true },
        });
        res.json(items);
        return;
    }
    catch (err) {
        next(err);
    }
}));
// GET /api/opportunities/:id - get one opportunity
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield prisma_1.default.opportunity.findUnique({
            where: { id },
            include: { skills: true },
        });
        if (!item) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(item);
        return;
    }
    catch (err) {
        next(err);
    }
}));
// POST /api/opportunities - create an opportunity
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, skillIds } = req.body;
        if (!title || !description) {
            res.status(400).json({ error: 'Title and description are required' });
            return;
        }
        const connectSkills = (skillIds || []).map((id) => ({ id }));
        const created = yield prisma_1.default.opportunity.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                skills: { connect: connectSkills },
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
// PUT /api/opportunities/:id - update an opportunity
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { title, description, skillIds } = req.body;
        const existing = yield prisma_1.default.opportunity.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        const updated = yield prisma_1.default.opportunity.update({
            where: { id },
            data: Object.assign({ title: (_a = title === null || title === void 0 ? void 0 : title.trim()) !== null && _a !== void 0 ? _a : existing.title, description: (_b = description === null || description === void 0 ? void 0 : description.trim()) !== null && _b !== void 0 ? _b : existing.description }, (skillIds ? { skills: { set: skillIds.map((sid) => ({ id: sid })) } } : {})),
            include: { skills: true },
        });
        res.json(updated);
        return;
    }
    catch (err) {
        next(err);
    }
}));
// DELETE /api/opportunities/:id
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.opportunity.delete({ where: { id } });
        res.status(204).send();
        return;
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
