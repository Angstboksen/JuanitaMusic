import dotenv from "dotenv";
import { SetupConfig } from "./utils/types";
dotenv.config();

const testing: boolean = true

const SETUP_CONFIG: SetupConfig = {
  prefix: testing ? "-" : "!",
  token: testing ? process.env.TEST_TOKEN : process.env.BOT_TOKEN,
  botid: testing ? process.env.TEST_ID : process.env.BOT_ID,
  db_config: {
    host: testing ? process.env.DB_HOST_TEST! : process.env.DB_HOST!,
    user: testing ? process.env.DB_USER_TEST! : process.env.DB_USER!,
    password: testing ? process.env.DB_PASS_TEST! : process.env.DB_PASS!,
    database: testing ? process.env.DB_NAME_TEST! : process.env.DB_NAME!,
    port: testing
      ? Number(process.env.DB_PORT_TEST!)
      : Number(process.env.DB_PORT!),
  },
};

export default SETUP_CONFIG;
