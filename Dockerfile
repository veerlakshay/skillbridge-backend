FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm ci

COPY src ./src

RUN npx prisma generate && npm run build

ENV PORT=5000
EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]
