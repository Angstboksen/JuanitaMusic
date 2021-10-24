import { MessageEmbed, VoiceChannel } from "discord.js";
import moment from "moment";
import { Song } from "../types";
import { Track } from "../music/Track";
import { JuanitaSubscription } from "../music/JuanitaSubscription";

export const botCanJoin = (channel: VoiceChannel): Promise<boolean> => {
  return new Promise((done, error) => {
    if (channel && channel.type === "GUILD_VOICE") done(true);
    else done(false);
  });
};

export const secondsToTimestamp = (seconds: number): string => {
  if (seconds < 3600) {
    return moment().startOf("day").seconds(seconds).format("mm:ss");
  }
  return moment().startOf("day").seconds(seconds).format("HH:mm:ss");
};

export const createEmbed = () => {
  return new MessageEmbed().setColor("RANDOM");
};

export const createErrorEmbed = (message: string) => {
  return new MessageEmbed()
    .setColor("#ff3300")
    .setTitle("Error")
    .setDescription(message);
};

export const createInfoEmbed = (message: string = "") => {
  return createEmbed().setDescription(message);
};

export const songEmbed = (
  song: Song,
  substription: JuanitaSubscription,
  forcetime: number = 0
): MessageEmbed => {
  const { title, url, requestor } = song;
  return createEmbed()
    .setTitle("▶️ Nå spilles:")
    .setDescription(
      `:notes:  **Tittel:** _${title}_
        :beginner: **Youtube link:** ${url}
        :arrows_counterclockwise: **Antall sanger i køen:** \`${
          substription.queue.length
        }\`
        :timer: **Beregnet tid igjen:** \`${secondsToTimestamp(
          forcetime > 0 ? forcetime : substription.time(song)
        )}\` \`${substription.bar()}\`\n`
    )
    .setURL(url)
    .setThumbnail(song.thumbnail!)
    .addField("Lagt til av ", `\`${requestor!.tag}\``);
};

export const addedToQueueEmbed = (song: Song) => {
  return createInfoEmbed(
    `:white_check_mark: **La til** _${song.title}_ **i køen**`
  );
};

export const playbackErrorEmbed = () => {
  return createInfoEmbed(":x: **Her skjedde det en feil med avspillingen.. **");
};

export const queueFinishedEmbed = () => {
  return createInfoEmbed(
    ":white_check_mark: :scroll: **Da var denne køen ferdig for denne gang!**\n" +
      ":x: **Ey bror fuck deg - vi chattes på jobben a**"
  );
};

export const skipSongEmbed = () => {
  return createInfoEmbed(":mage: **Skippetipangen, bort med den sangen!**");
};

export const cumEmbed = () => {
  return createInfoEmbed(
    ":kissing_heart: **Okei her kommer jeg** :heart_eyes:"
  );
};

export const emptyQueueEmbed = () => {
  return createInfoEmbed(
    ":scroll: **Køen er tom. Bruk ** `!p <søkestreng|url>` **for å legge til sanger**"
  );
};

export const killedSongEmbed = (song: Song) => {
  return createInfoEmbed(
    `:white_check_mark: Fjernet \`${song.title}\` fra køen`
  );
};

export const noCurrentSongEmbed = () => {
  return createInfoEmbed(
    ":notes: **Ingen sang spilles nå. Bruk ** `!p <søkestreng>` **for å legge til sanger**"
  );
};

export const shuffleArray = (array: Array<any>) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const a = array[i];
    array[i] = array[j];
    array[j] = a;
  }
  return array;
};

export const filteredTitle = (title: string) => {
  const newTitle = title.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );
  return newTitle.replace("**", "gg");
};

export const tokenize = (content: string) => {
  return content.split(" ").slice(1).join(" ");
};

export const isValidYTLink = (url: string) => {
  const regex: RegExp =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return url.match(regex) !== null;
};
