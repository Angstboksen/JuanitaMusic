
# 🎵 JuanitaMusic (aka. Juanita)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6f012ea4b47d45ab88391d2fd7794812)](https://app.codacy.com/gh/Angstboksen/JuanitaMusic?utm_source=github.com&utm_medium=referral&utm_content=Angstboksen/JuanitaMusic&utm_campaign=Badge_Grade)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/AngstBoksen/JuanitaMusic/graphs/commit-activity)
[![GitHub contributors](https://img.shields.io/github/contributors/Angstboksen/JuanitaMusic.svg)](https://GitHub.com/Angstboksen/JuanitaMusic/graphs/contributors/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/Angstboksen/JuanitaMusic/pulls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![https://discord.com/api/oauth2/authorize?client_id=708320525285457950&permissions=0&scope=bot][logo]

A Discord bot for playing music with friends on discord. <br>

Invite the bot to your discord server [by following this link](https://discord.com/api/oauth2/authorize?client_id=708320525285457950&permissions=0&scope=bot)

[logo]: https://cdn.discordapp.com/app-icons/708320525285457950/392f659c8b929799b917f0192b872ea5.png?size=512 "Juanita doing her thing"

## 📰 Commands

These are the current accepted commands. As the bot is still in development, some of these might be a little fucked.They should however, work as intended.
The command itself is the one with the `!` in front of it, while any other parameters is described inside the `<>`. Happy dying! 💀

| Command | Description | Aliases |
| --- | --- | --- |
| __Common commands__ |
| `!p <URL or keywords>` | Plays or adds to queue the song fetched based on the keywords provided | `!play` `!sing` |
| `!first <URL or keywords>` | Plays or puts at the top of the queue the song fetched based on the keywords provided | `!f` `!quick` `!speed` |
| `!s` | Skips the song currently playing | `!skip` |
| `!st <position:number>` | Jumps to the given position in the queue | `!skipto` `!jump` |
| `!kill <position:number>` | Removes the song at the given position from the queue | `!unqueue` `!unq` `!remove` `!rm` |
| `!now` | Shows the song currently playing | `!np` `!current` `!song` |
| `!q` | Shows the current queue | `!queue` `!queu` `!que` |
| `!cum` | Makes the bot join the voicechannel | `!come` `!join` `!j` |
| `!leave` | Kicks the bot from the voice channel | `!l` `!disconnect` `!kys` `!die` |
| `!help` | Provides a list of all current possible commands | `!h` `!commands` `!how` | 
| __Spotify commands__ |
| `!spotify <playlist id:string>` | Shuffles a playlist from spotify with the given playlist id | `!sptf` `!hax` |
| `!remember <playlist id: string> <alias: string>` | Remembers the given Spotify playlist id as the given alias to be used later | `!remember` `!rem` `!husk` `!import` |
| `!aliases` | Shows a list of all aliases and their corresponding spotify playlists | `!alist` |



## 💡 Misc

JuanitaMusic aka. Juanita is currently being hosted on Heroku <br>
More commands will be added as time goes by

Made with Discord.js written in TypeScript

[MIT License](./LICENSE)
