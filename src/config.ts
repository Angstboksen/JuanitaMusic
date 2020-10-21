import dotenv from "dotenv";
import { SetupConfig } from "./utils/types";
dotenv.config();

const testing = true;

const SETUP_CONFIG: SetupConfig = {
  prefix: testing ? "-" : "!",
  token: testing ? process.env.TEST_TOKEN : process.env.BOT_TOKEN,
};

export default SETUP_CONFIG;
