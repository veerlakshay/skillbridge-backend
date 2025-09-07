"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const skills_1 = __importDefault(require("./routes/skills"));
const opportunities_1 = __importDefault(require("./routes/opportunities"));
const users_1 = __importDefault(require("./routes/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => {
    res.status(200).json({ message: 'SkillBridge API is running ✅' });
});
app.use('/api/skills', skills_1.default);
app.use('/api/opportunities', opportunities_1.default);
app.use('/api/users', users_1.default);
// Simple error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    if ((err === null || err === void 0 ? void 0 : err.code) === 'P2002') {
        res.status(409).json({ error: 'Duplicate value' });
        return;
    }
    res.status(500).json({ error: 'Internal Server Error' });
};
app.use(errorHandler);
exports.default = app;
