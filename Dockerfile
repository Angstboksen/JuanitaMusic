FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production && npm install drizzle-kit tsx
COPY --from=build /app/dist ./dist
COPY drizzle.config.ts ./
COPY src/db/schema.ts ./src/db/schema.ts
CMD ["sh", "-c", "npx drizzle-kit push && node dist/index.js"]
