"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { createSession, type FormState } from "../actions";

const initialState: FormState = { message: null };
const storageKey = "sessionForm";

export default function SchedulePage() {
  const [state, dispatch] = useFormState(createSession, initialState);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");

  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setTitle(data.title || "");
        const t = data.date && data.startTime
          ? `${data.date} ${data.startTime}${data.endTime ? `-${data.endTime}` : ""}`
          : "";
        setTime(t);
        setVenue(data.location || "");
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  useEffect(() => {
    if (!state.message && state.id) {
      localStorage.removeItem(storageKey);
      router.replace(`/admin/sessions?new=${state.id}`);
    }
  }, [state, router]);

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Schedule Session</h1>
      <form action={dispatch} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium mb-1">
            Time
          </label>
          <input
            id="time"
            name="time"
            value={time}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="venue" className="block text-sm font-medium mb-1">
            Venue
          </label>
          <input
            id="venue"
            name="venue"
            value={venue}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Price
          </label>
          <input id="price" name="price" className="w-full border rounded p-2" />
        </div>
        <div>
          <label htmlFor="spots" className="block text-sm font-medium mb-1">
            Spots
          </label>
          <input
            id="spots"
            name="spots"
            type="number"
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label htmlFor="roster" className="block text-sm font-medium mb-1">
            Roster (comma-separated)
          </label>
          <input id="roster" name="roster" className="w-full border rounded p-2" />
        </div>
        {state.message && (
          <p className="text-red-500 text-sm">{state.message}</p>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Session
        </button>
      </form>
    </main>
  );
}

