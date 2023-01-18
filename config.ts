import { config } from 'dotenv';
config();

export type JuanitaConfig = {
	app: {
		token: string | undefined;
		playing: string;
		global: boolean;
		guild: string | undefined;
	};
	opt: {
		DJ: {
			enabled: boolean;
			roleName: string;
			commands: string[];
		};
		maxVol: number;
		leaveOnEnd: boolean;
		loopMessage: boolean;
		spotifyBridge: boolean;
		defaultvolume: number;
		discordPlayer: {
			ytdlOptions: {
				quality: string;
				highWaterMark: number;
			};
		};
	};
};

const envConfig: JuanitaConfig = {
	app: {
		token: process.env.BOT_TOKEN,
		playing: 'Yeeting bangers ❤️',
		global: !process.env.DEV,
		guild: process.env.DEV ?? process.env.DEV_GUILD,
	},

	opt: {
		DJ: {
			enabled: false,
			roleName: 'Lord of the Bangers',
			commands: [],
		},
		maxVol: 100,
		leaveOnEnd: true,
		loopMessage: false,
		spotifyBridge: true,
		defaultvolume: 75,
		discordPlayer: {
			ytdlOptions: {
				quality: 'highestaudio',
				highWaterMark: 1 << 25,
			},
		},
	},
};

export default envConfig;
