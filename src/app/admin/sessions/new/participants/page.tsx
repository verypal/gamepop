"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import sessionForm from "../sessionForm";

export default function ParticipantsPage() {
  const router = useRouter();
  const [roster, setRoster] = useState("");

  useEffect(() => {
    const data = sessionForm.load();
    setRoster(data.roster || "");
  }, []);

  function handleNext(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sessionForm.save({ roster });
    router.push("/admin/sessions/new/schedule");
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Participants</h1>
      <form onSubmit={handleNext} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Roster (comma-separated)</label>
          <input
            name="roster"
            value={roster}
            onChange={(e) => setRoster(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Next
        </button>
      </form>
    </main>
  );
}
