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
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minPlayers, setMinPlayers] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [minError, setMinError] = useState<string | null>(null);
  const [maxError, setMaxError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [msgError, setMsgError] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setDate(data.date || "");
        setStartTime(data.startTime || "");
        setEndTime(data.endTime || "");
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

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPlayers(value);
    const num = Number(value);
    if (!value || num < 1) {
      setMinError("Min players must be at least 1");
    } else {
      setMinError(null);
      if (maxPlayers) {
        const max = Number(maxPlayers);
        if (max < num) {
          setMaxError("Max players must be ≥ min players");
        } else if (max > 100) {
          setMaxError("Max players cannot exceed 100");
        } else {
          setMaxError(null);
        }
      }
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPlayers(value);
    const num = Number(value);
    const min = Number(minPlayers);
    if (!value) {
      setMaxError("Max players is required");
    } else if (num < min) {
      setMaxError("Max players must be ≥ min players");
    } else if (num > 100) {
      setMaxError("Max players cannot exceed 100");
    } else {
      setMaxError(null);
    }
  };

  const handleMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setMessage(value);
    if (value.length > 500) {
      setMsgError("Message cannot exceed 500 characters");
    } else {
      setMsgError(null);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const msg = (formData.get("message") as string) || "";
    formData.set("message", msg.replace(/\n/g, " "));
    return dispatch(formData);
  };

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Schedule Session</h1>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="time" className="block text-sm font-medium mb-1">
            Time
          </label>
          <input
            id="time"
            value={
              date && startTime
                ? `${date} ${startTime}${endTime ? `-${endTime}` : ""}`
                : ""
            }
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="startTime" value={startTime} />
          <input type="hidden" name="endTime" value={endTime} />
        </div>
        <div>
          <label
            htmlFor="minPlayers"
            className="block text-sm font-medium mb-1"
          >
            Min Players
          </label>
          <input
            id="minPlayers"
            name="minPlayers"
            type="number"
            required
            min={1}
            max={100}
            value={minPlayers}
            onChange={handleMinChange}
            className="w-full border rounded p-2"
          />
          {minError && <p className="text-red-500 text-sm">{minError}</p>}
        </div>
        <div>
          <label
            htmlFor="maxPlayers"
            className="block text-sm font-medium mb-1"
          >
            Max Players
          </label>
          <input
            id="maxPlayers"
            name="maxPlayers"
            type="number"
            required
            min={minPlayers ? Number(minPlayers) : 1}
            max={100}
            value={maxPlayers}
            onChange={handleMaxChange}
            className="w-full border rounded p-2"
          />
          {maxError && <p className="text-red-500 text-sm">{maxError}</p>}
        </div>
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium mb-1"
          >
            Message (optional)
          </label>
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={handleMessageChange}
            rows={4}
            className="w-full border rounded p-2"
          />
          <div className="text-sm text-gray-500 mt-1">
            {message.length} / 500
          </div>
          {msgError && <p className="text-red-500 text-sm">{msgError}</p>}
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

