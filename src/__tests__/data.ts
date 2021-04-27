import { Song } from "../types";

export const testSongArray: Song[] = [
  {
    title: "Song 1",
    seconds: 1,
    url: "url 1",
    requestor: {
      tag: "User1#1234",
      id: "1",
    },
    thumbnail: "thumbnail1",
    isSpotify: false,
  },
  {
    title: "Song 2",
    seconds: 2,
    url: "url 2",
    requestor: {
      tag: "User2#1234",
      id: "2",
    },
    isSpotify: true,
  },
  {
    title: "Song 3",
    seconds: 3,
    url: "url 3",
    requestor: {
      tag: "User3#1234",
      id: "3",
    },
    thumbnail: "thumbnail3",
    isSpotify: false,
  },
];

export const testSong: Song = {
  title: "Song 4",
  seconds: 4,
  url: "url 4",
  requestor: {
    tag: "User4#1234",
    id: "4",
  },
  thumbnail: "thumbnail4",
  isSpotify: false,
};
