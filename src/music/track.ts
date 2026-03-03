export interface Track {
  title: string;
  url: string;
  duration: number; // milliseconds
  thumbnail: string | null;
  requester: any;
}
