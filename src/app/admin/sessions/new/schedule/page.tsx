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
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");

  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setTitle(data.title || "");
        setDate(data.date || "");
        setStartTime(data.startTime || "");
        setEndTime(data.endTime || "");
        setVenue(data.venue || data.location || "");
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
            value={title}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
          <input type="hidden" name="title" value={title} />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium mb-1">
            Time
          </label>
          <input
            id="time"
            value={date && startTime ? `${date} ${startTime}${endTime ? `-${endTime}` : ""}` : ""}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="startTime" value={startTime} />
          <input type="hidden" name="endTime" value={endTime} />
        </div>
        <div>
          <label htmlFor="venue" className="block text-sm font-medium mb-1">
            Venue
          </label>
          <input
            id="venue"
            value={venue}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
          <input type="hidden" name="venue" value={venue} />
        </div>
        <div>
          <label htmlFor="minPlayers" className="block text-sm font-medium mb-1">
            Minimum Players
          </label>
          <input
            id="minPlayers"
            name="minPlayers"
            type="number"
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label htmlFor="maxPlayers" className="block text-sm font-medium mb-1">
            Maximum Players
          </label>
          <input
            id="maxPlayers"
            name="maxPlayers"
            type="number"
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            className="w-full border rounded p-2"
          />
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

