FROM node:22-slim AS build
WORKDIR /app
# Required for native modules (sodium-native, @discordjs/opus)
RUN apt-get update && apt-get install -y python3 make g++ libopus-dev && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
# Required for native modules (sodium-native, @discordjs/opus) and audio streaming
# Install yt-dlp via pip for latest version (apt version is too old for YouTube)
RUN apt-get update && apt-get install -y python3 python3-pip make g++ libopus-dev ffmpeg && rm -rf /var/lib/apt/lists/* \
    && pip3 install --break-system-packages yt-dlp
COPY package.json package-lock.json* ./
RUN npm install --production && npm install drizzle-kit tsx
COPY --from=build /app/dist ./dist
COPY src/voice/keywords ./dist/voice/keywords
COPY drizzle.config.ts ./
COPY src/db/schema.ts ./src/db/schema.ts
CMD ["sh", "-c", "npx drizzle-kit push && node dist/index.js"]
