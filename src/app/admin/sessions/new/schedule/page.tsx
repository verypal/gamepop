"use client";

import { useEffect, useState } from "react";
import sessionForm, { SessionFormData } from "../sessionForm";
import { createSession } from "../actions";

export default function SchedulePage() {
  const [data, setData] = useState<SessionFormData>({});

  useEffect(() => {
    const loaded = sessionForm.load();
    setData(loaded);
  }, []);

  function handleSubmit() {
    sessionForm.clear();
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Review &amp; Create</h1>
      <div className="space-y-2 mb-4">
        <p>
          <span className="font-medium">Title:</span> {data.title}
        </p>
        <p>
          <span className="font-medium">Time:</span> {data.time}
        </p>
        <p>
          <span className="font-medium">Venue:</span> {data.venue}
        </p>
        <p>
          <span className="font-medium">Price:</span> {data.price}
        </p>
        <p>
          <span className="font-medium">Spots:</span> {data.spots}
        </p>
        {data.roster ? (
          <p>
            <span className="font-medium">Roster:</span> {data.roster}
          </p>
        ) : null}
      </div>
      <form action={createSession} onSubmit={handleSubmit} className="mt-4">
        <input type="hidden" name="title" value={data.title || ""} />
        <input type="hidden" name="time" value={data.time || ""} />
        <input type="hidden" name="venue" value={data.venue || ""} />
        <input type="hidden" name="price" value={data.price || ""} />
        <input type="hidden" name="spots" value={data.spots || ""} />
        <input type="hidden" name="roster" value={data.roster || ""} />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create
        </button>
      </form>
    </main>
  );
}

