// create function that converts from 00:00:00 or 00:00 to milliseconds
export const timeToMilliseconds = (time: string) => {
	const [seconds, minutes, hours] = time.split(':').reverse().map((t) => parseInt(t));
	return (hours ? hours * 60 * 60 * 1000 : 0) + minutes! * 60 * 1000 + seconds! * 1000;
};

// create function that converts from milliseconds to 00:00 if less than 1 hour, or 00:00:00 if more than 1 hour
export const millisecondsToTime = (milliseconds: number) => {
	const hours = Math.floor(milliseconds / 1000 / 60 / 60);
	const minutes = Math.floor(milliseconds / 1000 / 60) % 60;
	const seconds = Math.floor(milliseconds / 1000) % 60;
	return `${hours ? hours + ':' : ''}${minutes < 10 ? '0' + minutes : minutes}:${
		seconds < 10 ? '0' + seconds : seconds
	}`;
};
