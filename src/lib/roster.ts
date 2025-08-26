export type Player = {
  id: string;
  name: string;
};

// Simulated fetch of a squad roster. In a real app this would query an API or database.
export async function fetchRoster(): Promise<Player[]> {
  return [
    { id: "owner1", name: "Owner" },
    { id: "p2", name: "Player 2" },
    { id: "p3", name: "Player 3" },
    { id: "p4", name: "Player 4" },
    { id: "p5", name: "Player 5" },
    { id: "p6", name: "Player 6" },
    { id: "p7", name: "Player 7" },
    { id: "p8", name: "Player 8" },
    { id: "p9", name: "Player 9" },
    { id: "p10", name: "Player 10" },
  ];
}
