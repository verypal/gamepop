export type SessionRow = {
  id: string;
  time: string | null;
  min_players: number | null;
  max_players: number | null;
  message: string | null;
};

export function buildShareText(session: SessionRow, url: string): string {
  return (
    `${session.time ?? ""}\n` +
    `Players: ${session.min_players ?? ""}-${session.max_players ?? ""}\n` +
    `${session.message ?? ""}\n` +
    `Join: ${url}`
  );
}
