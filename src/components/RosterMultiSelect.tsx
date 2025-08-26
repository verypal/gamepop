"use client";

import { useEffect, useState } from "react";
import { fetchRoster, type Player } from "@/lib/roster";

type Props = {
  ownerId: string;
  maxPlayers: number;
};

export default function RosterMultiSelect({ ownerId, maxPlayers }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [autoMarked, setAutoMarked] = useState<string[]>([ownerId]);

  useEffect(() => {
    fetchRoster().then(setPlayers);
  }, []);

  const toggle = (id: string) => {
    setAutoMarked((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= maxPlayers) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedNames = autoMarked
    .map((id) => players.find((p) => p.id === id)?.name)
    .filter((n): n is string => Boolean(n));

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Roster ({autoMarked.length}/{maxPlayers})
      </label>
      <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
        {players.map((p) => (
          <label key={p.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoMarked.includes(p.id)}
              disabled={!autoMarked.includes(p.id) && autoMarked.length >= maxPlayers}
              onChange={() => toggle(p.id)}
            />
            <span>{p.name}</span>
          </label>
        ))}
      </div>
      <input type="hidden" name="roster" value={selectedNames.join("," )} />
      <input type="hidden" name="autoMarked" value={autoMarked.join("," )} />
    </div>
  );
}
