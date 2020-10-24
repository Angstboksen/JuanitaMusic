import Discord, { Client, Message, TextChannel } from "discord.js";
import SETUP_CONFIG from "./config";
import Juanita from "./bot/Juanita";
import {
  tokenize,
  isValidCommand,
  checkPrefixAndSenderNotBot,
  userInVoiceChannel,
} from "./utils/helpers";
import { BroadcastEnum } from "./utils/enums";
import {ERRORS} from './utils/messages'
import * as db from './database/DatabaseHandler'

const client: Client = new Discord.Client();
let JUANITA: Juanita | undefined;
const { token, prefix } = SETUP_CONFIG;

client.on("ready", async () => {
  console.log(`Let's get ready to rumble!`);
  const guilds = await db.initializeGuilds();
  JUANITA = new Juanita(client, guilds)
  JUANITA._initialize();
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  JUANITA!.broadcast(BroadcastEnum.DISCONNECT);
  console.log("Disconnect!");
});

client.on("message", (message: Message) => {
  if(!JUANITA) return
  if (checkPrefixAndSenderNotBot(prefix, message)) {
    const tokens: string[] = tokenize(message.content.toLowerCase());
    if (isValidCommand(tokens[0])) {
      if(userInVoiceChannel(message.member!)){
        JUANITA.execute(message, tokens);
      }else {
        JUANITA.sendMessage(message.channel as TextChannel, ERRORS.USER_NOT_IN_VOICE)
      }
    } else {
      JUANITA.wrongCommand(message.channel as TextChannel);
    }
  }
});

client.login(token);
