import dotenv from "dotenv";
import { SetupConfig } from "./utils/types";
dotenv.config();

const testing: boolean = true;

const SETUP_CONFIG: SetupConfig = {
  prefix: testing ? "-" : "!",
  token: testing ? process.env.TEST_TOKEN : process.env.BOT_TOKEN,
  botid: testing ? process.env.TEST_ID : process.env.BOT_ID,
  db_config: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    port: Number(process.env.DB_PORT!),
  },
};

export default SETUP_CONFIG;
