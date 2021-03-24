import { config } from "dotenv";
config();

type SetupConfig = {
  token: string;
  botid: string;
  prefix: string;
  spotify_id: string;
  spotify_secret: string;
  authorization_code: string;
};

const SETUP_CONFIG: SetupConfig = {
  token: process.env.JUANITA_TOKEN!,
  botid: process.env.JUANITA_ID!,
  spotify_id: process.env.SPOTIFY_ID!,
  spotify_secret: process.env.SPOTIFY_SECRET!,
  authorization_code: process.env.SPOTIFY_CODE!,
  prefix: "-",
};

export default SETUP_CONFIG;
