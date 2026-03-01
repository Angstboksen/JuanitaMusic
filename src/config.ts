import "dotenv/config";

export interface JuanitaConfig {
  bot: {
    token: string;
    devGuildId?: string;
  };
  lavalink: {
    host: string;
    port: number;
    password: string;
  };
  database: {
    url: string;
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config: JuanitaConfig = {
  bot: {
    token: requireEnv("BOT_TOKEN"),
    devGuildId: process.env.DEV_GUILD_ID,
  },
  lavalink: {
    host: process.env.LAVALINK_HOST ?? "localhost",
    port: parseInt(process.env.LAVALINK_PORT ?? "2333"),
    password: process.env.LAVALINK_PASSWORD ?? "youshallnotpass",
  },
  database: {
    url: requireEnv("DATABASE_URL"),
  },
};
