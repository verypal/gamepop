export type SessionRow = {
  id: string;
  title: string;
  time: string | null;
  venue: string | null;
  payments_enabled: boolean | null;
  price: number | null;
  currency: string | null;
  spots_left: number | null;
  roster: string[] | null;
};

export function buildShareText(session: SessionRow, url: string): string {
  return (
    `${session.title}\n` +
    `Time: ${session.time ?? ""}\n` +
    `Venue: ${session.venue ?? ""}\n` +
    `Price: ${
      session.payments_enabled
        ? `${session.price ?? ""} ${session.currency ?? ""}`
        : ""
    }\n` +
    `Spots left: ${session.spots_left ?? 0}\n` +
    `Join: ${url}`
  );
}
