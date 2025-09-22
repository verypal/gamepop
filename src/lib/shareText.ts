export type SessionRow = {
  id: string;
  title: string | null;
  venue: string | null;
  time: string | null;
  min_players: number | null;
  max_players: number | null;
  message: string | null;
};

export function buildShareText(session: SessionRow, url: string): string {
  const lines: string[] = [];

  if (session.title) {
    lines.push(session.title);
  }

  if (session.venue) {
    lines.push(session.venue);
  }

  if (session.time) {
    lines.push(session.time);
  }

  if (session.min_players !== null || session.max_players !== null) {
    lines.push(
      `Players: ${session.min_players ?? ""}-${session.max_players ?? ""}`,
    );
  }

  if (session.message) {
    lines.push(session.message);
  }

  lines.push(`Join: ${url}`);

  return lines.join("\n");
}
