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
  const lines: string[] = [session.title];
  if (session.time) lines.push(`Time: ${session.time}`);
  if (session.venue) lines.push(`Venue: ${session.venue}`);
  if (session.price) lines.push(`Price: ${session.price}`);
  lines.push(`Spots left: ${session.spots_left ?? 0}`);
  lines.push(`Join: ${url}`);
  return lines.filter(Boolean).join("\n");
}
