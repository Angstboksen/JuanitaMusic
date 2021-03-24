// Use the Client that are provided by @typeit/discord NOT discord.js
import { Client } from "@typeit/discord";
import SETUP_CONFIG from "./config";

const { token } = SETUP_CONFIG;

export class Main {
  private static _client: Client = new Client();

  static get Client(): Client {
    return this._client;
  }

  static async start() {
    await this._client.login(token, `${__dirname}/*.ts`);
  }
}

Main.start();
