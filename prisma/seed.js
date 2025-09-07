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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Upsert base skills
        const skillNames = [
            'JavaScript',
            'TypeScript',
            'React',
            'Node.js',
            'Express',
            'PostgreSQL',
            'Prisma',
            'Docker',
            'CI/CD',
        ];
        const skills = [];
        for (const name of skillNames) {
            const s = yield prisma.skill.upsert({
                where: { name },
                update: {},
                create: { name },
            });
            skills.push(s);
        }
        const findSkill = (name) => skills.find((s) => s.name === name);
        // Users
        const alice = yield prisma.user.upsert({
            where: { email: 'alice@example.com' },
            update: {},
            create: {
                name: 'Alice',
                email: 'alice@example.com',
                skills: { connect: [findSkill('React'), findSkill('TypeScript')].map((s) => ({ id: s.id })) },
            },
        });
        const bob = yield prisma.user.upsert({
            where: { email: 'bob@example.com' },
            update: {},
            create: {
                name: 'Bob',
                email: 'bob@example.com',
                skills: { connect: [findSkill('Node.js'), findSkill('Express'), findSkill('PostgreSQL')].map((s) => ({ id: s.id })) },
            },
        });
        // Opportunities
        yield prisma.opportunity.createMany({
            data: [
                { title: 'Frontend Intern', description: 'Build UI with React + TS' },
                { title: 'Backend Intern', description: 'API with Node, Express, Prisma' },
                { title: 'DevOps Trainee', description: 'Dockerize apps and set up CI' },
            ],
            skipDuplicates: true,
        });
        const allOpps = yield prisma.opportunity.findMany();
        const oppByTitle = (title) => allOpps.find((o) => o.title === title);
        // Connect skills to opportunities
        yield prisma.opportunity.update({
            where: { id: oppByTitle('Frontend Intern').id },
            data: { skills: { set: [findSkill('React'), findSkill('TypeScript')].map((s) => ({ id: s.id })) } },
        });
        yield prisma.opportunity.update({
            where: { id: oppByTitle('Backend Intern').id },
            data: { skills: { set: [findSkill('Node.js'), findSkill('Express'), findSkill('PostgreSQL'), findSkill('Prisma')].map((s) => ({ id: s.id })) } },
        });
        yield prisma.opportunity.update({
            where: { id: oppByTitle('DevOps Trainee').id },
            data: { skills: { set: [findSkill('Docker'), findSkill('CI/CD')].map((s) => ({ id: s.id })) } },
        });
        console.log('Seed complete:', { userCount: 2, skillCount: skills.length, opportunityCount: allOpps.length });
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
