import "dotenv/config";

export interface JuanitaConfig {
  bot: {
    token: string;
    devGuildId?: string;
  };
  database: {
    url: string;
  };
  openai?: {
    apiKey: string;
    model: string;
  };
  voice?: {
    picovoiceAccessKey: string;
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
  database: {
    url: requireEnv("DATABASE_URL"),
  },
  openai: process.env.OPENAI_API_KEY
    ? {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      }
    : undefined,
  voice: process.env.PICOVOICE_ACCESS_KEY
    ? {
        picovoiceAccessKey: process.env.PICOVOICE_ACCESS_KEY,
      }
    : undefined,
};
