import { Message, MessageEmbed } from "discord.js";
import moment from "moment";
import Queue from "../logic/Queue";
import { Song } from "../types";

export const botCanJoin = (msg: Message): Promise<boolean> => {
  return new Promise((done, error) => {
    let channel = msg.member!.voice.channel;
    if (channel && channel.type === "voice") done(true);
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

export const songEmbed = (song: Song, queue: Queue, forcetime: number = 0) => {
  const { title, url, requestor } = song;
  return createEmbed()
    .setTitle("▶️ Nå spilles:")
    .setDescription(
      `:notes:  **Tittel:** _${title}_
        :beginner: **Youtube link:** ${url}
        :arrows_counterclockwise: **Antall sanger i køen:** \`${queue.size()}\`
        :timer: **Beregnet tid igjen:** \`${secondsToTimestamp(
          forcetime > 0 ? forcetime : queue.time()
        )}\` \`${queue.bar()}\`\n`
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

export const queueFinishedEmbed = () => {
  return createInfoEmbed(
    ":white_check_mark: :scroll: **Da var denne køen ferdig for denne gang!** :white_check_mark:\n" +
      ":x: **Ey bror fuck deg - vi chattes på jobben a** :zipper_mouth:"
  );
};

export const skipSongEmbed = () => {
  return createInfoEmbed(
    ":mage: **Skippetipangen, bort med den sangen!** :no_entry:"
  );
};

export const leaveEmbed = () => {
  return createInfoEmbed(
    ":x: **Eyy bror fuck deg - vi chattes på jobben a** :zipper_mouth:"
  );
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

export const skippedToEmbed = (song: Song, position: number) => {
  return createInfoEmbed(
    `:white_check_mark: Hoppet til posisjon \`${position}\` i køen.\n 
    :arrow_forward: Spiller nå: \`${song.title}\` fra køen`
  );
};

export const queueEmbed = (queue: Queue, page: number = 1) => {
  if (queue.empty()) {
    return emptyQueueEmbed();
  }

  const items = [];
  const { current } = queue;
  let totalTime = queue.time();

  for (let i = (page - 1) * 5; i < queue.size(); i++) {
    const item = queue.songs[i];
    const { title, url, seconds, requestor } = item;
    if (i < (page - 1) * 5 + 5) {
      items.push(
        ` **\`${
          i + 1
        }\`.[${title}](${url})\nEstimert tid:** \`${secondsToTimestamp(
          seconds
        )}\`\n**Lagt til av**: \`${requestor!.tag}\``
      );
    }
    totalTime += seconds;
  }

  let desc =
    "**:notes:  Totalt antall sanger: ** `" +
    queue.size() +
    "` \n\n" +
    (current !== null
      ? "------------------------------------------------------------\n :arrow_forward: **Nå spilles: **\n" +
        ` **[${current.title}](${
          current.url
        })\nEstimert tid igjen:** \`${secondsToTimestamp(
          queue.time()
        )}\`\n\`${queue.bar()}\`\n\n**Lagt til av**: \`${
          current.requestor!.tag
        }\`\n ------------------------------------------------------------ \n\n`
      : "") +
    items.join("\n\n") +
    "\n\n**:timer: Total beregnet tid:** " +
    `\`${secondsToTimestamp(
      totalTime
    )}\` \n\n Side \`${page}\` av \`${Math.floor(queue.size() / 5)}\``;

  return createInfoEmbed(desc).setTitle(
    ":scroll: **Her er køen slik den ser ut nå** \n"
  );
};

export const noCurrentSongEmbed = () => {
  return createInfoEmbed(
    ":notes: **Ingen sang spilles nå. Bruk ** `!p <søkestreng>` **for å legge til sanger**"
  );
};

export const helpEmbed = () => {
  return createInfoEmbed(
    ":arrow_up: Klikk på tittelen for å få en liste over kommandoer"
  )
    .setTitle(":newspaper: Hva kan jeg gjøre?")
    .setURL("https://github.com/Angstboksen/JuanitaMusic#commands");
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
  return content.split(" ").slice(1).join(" ")
}
