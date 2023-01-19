
# 🎵 JuanitaMusic (aka. Juanita)
![Build badge](https://img.shields.io/github/workflow/status/Angstboksen/JuanitaMusic/Build%20and%20test)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6f012ea4b47d45ab88391d2fd7794812)](https://app.codacy.com/gh/Angstboksen/JuanitaMusic?utm_source=github.com&utm_medium=referral&utm_content=Angstboksen/JuanitaMusic&utm_campaign=Badge_Grade)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/AngstBoksen/JuanitaMusic/graphs/commit-activity)
[![GitHub contributors](https://img.shields.io/github/contributors/Angstboksen/JuanitaMusic.svg)](https://GitHub.com/Angstboksen/JuanitaMusic/graphs/contributors/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/Angstboksen/JuanitaMusic/pulls)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

![Juanita in all her glory](https://cdn.discordapp.com/app-icons/708320525285457950/3dda5c526be85c3a9de9734250d28965.png?size=512)

A Discord bot for playing music with friends on discord. 

Invite the bot to your discord server [by following this link.](https://discord.com/api/oauth2/authorize?client_id=708320525285457950&permissions=8&scope=bot%20applications.commands)

## 📰 Commands

All commands are available using Discord slash application command interface. The commands, and their description, can be seen in the table below.

| Command | Description |
| --- | --- |
| __Common commands__ |
| `/play <URL or keywords:string>` | Plays or adds to queue the song fetched based on the keywords provided | 
| `/first <URL or keywords:string>` | Plays or puts at the top of the queue the song fetched based on the keywords provided | 
| `/spotify <playlistURI or alias:string>` | Queues all songs in a Spotify playlist given it's URI or stored alias |
| `/remember <playlistURI:string> <alias:string>` | Will store the given Spotify playlist URI to a custom name for easy use |
| `/jump <position: number>` | Jumps to the given position in the queue | 
| `/kill <position: number>` | Removes the song at the given position from the queue | 
| `/seek <time: number>` | Number of seconds in song to skip to. `/seek 120` will skip 2 minutes into the song |
| `/skip` | Skips the song currently playing. The bot will leave if the queue is empty |
| `/queue` | Shows the current queue in an embed |
| `/shuffle` | Will shuffle the queue randomly |
| `/clear` | Clears the queue, but not the current song |
| `/pause` | Pauses the current song if playing |
| `/resume` | Resumes the current song if paused |
| `/kys` | Kicks the bot from the voice channel. This will clear the queue.|


## 💡 Misc

Made with ❤️ and Discord.js written in TypeScript

[MIT License](./LICENSE)
