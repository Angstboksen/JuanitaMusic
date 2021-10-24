export type Song = {
  title: string;
  seconds: number;
  url: string;
  requestor: {
    tag: string;
    id: string;
  };
  thumbnail?: string;
  isSpotify: boolean;
};

export type Search = {
  title: string;
  requestor: {
    tag: string;
    id: string;
  };
  date: Date;
};
