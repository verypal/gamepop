"use client";

import { useState } from "react";

type Errors = {
  minPlayers?: string;
  maxPlayers?: string;
};

export default function ParticipantsPage() {
  const [minPlayers, setMinPlayers] = useState("0");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const newErrors: Errors = {};
    const min = parseInt(minPlayers || "0", 10);
    const max = maxPlayers ? parseInt(maxPlayers, 10) : undefined;

    if (minPlayers.length > 2) {
      newErrors.minPlayers = "Use at most two digits";
    }

    if (maxPlayers.length > 2) {
      newErrors.maxPlayers = "Use at most two digits";
    } else if (typeof max === "number" && max > 99) {
      newErrors.maxPlayers = "Must be ≤ 99";
    }

    if (typeof max === "number" && min > max) {
      newErrors.minPlayers = newErrors.minPlayers || "Must be ≤ max players";
      newErrors.maxPlayers = newErrors.maxPlayers || "Must be ≥ min players";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // handle valid form submission
      console.log({ minPlayers, maxPlayers });
    }
  };

  const inputBase = "w-full border rounded p-2";

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Participants</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Min Players</label>
          <input
            name="minPlayers"
            inputMode="numeric"
            value={minPlayers}
            onChange={(e) => setMinPlayers(e.target.value.replace(/\D/g, ""))}
            onBlur={validate}
            className={`${inputBase} ${errors.minPlayers ? "border-red-500" : ""}`}
          />
          {errors.minPlayers && (
            <p className="text-red-600 text-sm">{errors.minPlayers}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Players</label>
          <input
            name="maxPlayers"
            inputMode="numeric"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value.replace(/\D/g, ""))}
            onBlur={validate}
            className={`${inputBase} ${errors.maxPlayers ? "border-red-500" : ""}`}
          />
          {errors.maxPlayers && (
            <p className="text-red-600 text-sm">{errors.maxPlayers}</p>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </form>
    </main>
  );
}

