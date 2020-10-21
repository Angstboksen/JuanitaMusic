![https://discord.com/api/oauth2/authorize?client_id=708320525285457950&permissions=0&scope=bot][logo]

# RythmPlaylist (aka. Juanita), but in TypeScript this time
A Discord bot for saving and playing playlists. <br>

Invite the bot to your discord server [by following this link](https://discord.com/api/oauth2/authorize?client_id=708320525285457950&permissions=0&scope=bot)

[logo]: https://cdn.discordapp.com/app-icons/708320525285457950/392f659c8b929799b917f0192b872ea5.png?size=512 "Juanita doing her thing"

## Commands

These are the current accepted commands. As the bot is still in development, some of these might be a little fucked, but they should (in theory) work as intended.
The command itself is the one with the `!` in front of it, while any other parameters is described inside the `<>`. Happy dying!

| Command | Description |
| --- | --- |
| `!p <link or keywords>` | Will play the given song link, or search with the given keywords |
| `!pl <listname>` | Will play the given list in chronological order |
| `!first <link or keywords>` | Will place the given song fist in the current queue |
| `!shuffle <listname>` | Will play the given playlist in shuffle mode |
| `!r` | Will skip to the a random song in the queue, and append the skipped songs to the back of it  |
| `!s` | Will skip to the next song in the queue |
| `!skip <index>` | Will skip to the song at the index given in the queue |
| `!pause` | Will pause the current song |
| `!resume` | Resumes the song if it is paused |
| `!stop` | Will stop the bot and clear the queue |
| `!now` | Gives information about the currently playing song |
| `!q` | Will show the current queue |
| `!cum` | Will make the bot join the voice channel. It will not play anything |
| `!leave` | Will kick the bot from the voice channel |
| `!create <listname>` | Will create a new empty list with the given name |
| `!trust <listname> <@user>` | Will give editing permissions for the given list to the given user |
| `!add <listname> <link or keywords>` | Will add a song to the given list. The song will be either the given link, or a search for the given keywords |
| `!listall` | Will list all the stored lists with their name, number of songs and creator |
| `!list <listname>` | Will give overview over the songs in the given list |
| `!delsong <listname> <songindex>` | Will delete the song at the given index in the list |
| `!dellist <listname>` | Will delete the given list entirely |
| `!league` | Will randomize champions and lanes for up to 5 people currently in a voice channel |
| `!champ` | Will return a random league champion |
| `!pet` | Tell the bot is has done a good job. Good bot! |
| `!commands` | Will give a list over the commands with descriptions |

## Work on it yourself
This requires that you have your own Discord application bot already initialized.

1. Clone the project with the following command, or fork your own: <br>
```git clone https://github.com/Angstboksen/Juanita-ts.git``` <br>

2. After cloning. Be sure to have *npm* installed. Install the needed dependencies with either of the following command(s):  <br>
```npm i``` ```npm install```

3. If you want to run your bot, make sure to change the values of the environment variables located in *.env_setup* to match your values. After that is done, rename the file to *.env*

4. Run the bot with the following command: <br>
```npm start```<br>
This will automatically make your bot online in discord

## Misc

RythmPlaylist aka. Juanita is currently being hosted on Heroku
JuanitaPlaylist is another bot which works as a testing bot for when hotfixes must be pushed quickly

