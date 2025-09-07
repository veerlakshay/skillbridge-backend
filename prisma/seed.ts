import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
  const skills = [] as { id: string; name: string }[];
  for (const name of skillNames) {
    const s = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    skills.push(s);
  }

  const findSkill = (name: string) => skills.find((s) => s.name === name)!;

  // Users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice',
      email: 'alice@example.com',
      skills: { connect: [findSkill('React'), findSkill('TypeScript')].map((s) => ({ id: s.id })) },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob',
      email: 'bob@example.com',
      skills: { connect: [findSkill('Node.js'), findSkill('Express'), findSkill('PostgreSQL')].map((s) => ({ id: s.id })) },
    },
  });

  // Opportunities
  await prisma.opportunity.createMany({
    data: [
      { title: 'Frontend Intern', description: 'Build UI with React + TS' },
      { title: 'Backend Intern', description: 'API with Node, Express, Prisma' },
      { title: 'DevOps Trainee', description: 'Dockerize apps and set up CI' },
    ],
    skipDuplicates: true,
  });

  const allOpps = await prisma.opportunity.findMany();
  const oppByTitle = (title: string) => allOpps.find((o) => o.title === title)!;

  // Connect skills to opportunities
  await prisma.opportunity.update({
    where: { id: oppByTitle('Frontend Intern').id },
    data: { skills: { set: [findSkill('React'), findSkill('TypeScript')].map((s) => ({ id: s.id })) } },
  });
  await prisma.opportunity.update({
    where: { id: oppByTitle('Backend Intern').id },
    data: { skills: { set: [findSkill('Node.js'), findSkill('Express'), findSkill('PostgreSQL'), findSkill('Prisma')].map((s) => ({ id: s.id })) } },
  });
  await prisma.opportunity.update({
    where: { id: oppByTitle('DevOps Trainee').id },
    data: { skills: { set: [findSkill('Docker'), findSkill('CI/CD')].map((s) => ({ id: s.id })) } },
  });

  console.log('Seed complete:', { userCount: 2, skillCount: skills.length, opportunityCount: allOpps.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

