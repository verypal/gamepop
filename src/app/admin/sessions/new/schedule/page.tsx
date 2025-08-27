"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import sessionForm, { SessionFormData } from "../sessionForm";
import { createSession } from "../actions";

export default function SchedulePage() {
  const [form, setForm] = useState<SessionFormData>({
    title: "",
    time: "",
    venue: "",
    price: "",
    spots: "",
    roster: "",
  });

  useEffect(() => {
    const data = sessionForm.load();
    setForm((prev) => ({ ...prev, ...data }));
  }, []);

  function handleSubmit() {
    sessionForm.clear();
  }

  const [state, formAction] = useFormState(createSession, { message: null });

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Schedule</h1>
      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Title</p>
          <p>{form.title}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Time</p>
          <p>{form.time}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Venue</p>
          <p>{form.venue}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Price</p>
          <p>{form.price}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Spots</p>
          <p>{form.spots}</p>
        </div>
        <input type="hidden" name="title" value={form.title || ""} />
        <input type="hidden" name="time" value={form.time || ""} />
        <input type="hidden" name="venue" value={form.venue || ""} />
        <input type="hidden" name="price" value={form.price || ""} />
        <input type="hidden" name="spots" value={form.spots || ""} />
        <input type="hidden" name="roster" value={form.roster || ""} />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Session
        </button>
      </form>
      {state.message && (
        <p className="mt-4 text-red-600" role="alert">
          {state.message}
        </p>
      )}
    </main>
  );
}

