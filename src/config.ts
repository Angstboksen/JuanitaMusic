import { config } from "dotenv";
config();

type DBConfig = {
  host: string;
  user: string;
  port: number;
  password: string;
  database: string;
};

type SetupConfig = {
  token: string;
  botid: string;
  prefix: string;
  spotify_id: string;
  spotify_secret: string;
  db_config: DBConfig;
};

const SETUP_CONFIG: SetupConfig = {
  token: process.env.BOT_TOKEN!,
  botid: process.env.BOT_ID!,
  spotify_id: process.env.SPOTIFY_ID!,
  spotify_secret: process.env.SPOTIFY_SECRET!,
  prefix: "!",
  db_config: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    port: Number(process.env.DB_PORT!),
  },
};

export default SETUP_CONFIG;
