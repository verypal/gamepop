export type SessionRow = {
  id: string;
  title: string;
  time: string | null;
  venue: string | null;
  price: string | null;
  spots_left: number | null;
  roster: string[] | null;
};

export function buildShareText(session: SessionRow, url: string): string {
  return (
    `${session.title}\n` +
    `Time: ${session.time ?? ""}\n` +
    `Venue: ${session.venue ?? ""}\n` +
    `Price: ${session.price ?? ""}\n` +
    `Spots left: ${session.spots_left ?? 0}\n` +
    `Join: ${url}`
  );
}
