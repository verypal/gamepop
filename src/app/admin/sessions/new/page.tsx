"use client";

import { useFormState } from "react-dom";
import { createSession, type FormState } from "./actions";
import RosterMultiSelect from "@/components/RosterMultiSelect";

const initialState: FormState = { message: null };

export default function NewSessionPage() {
  const [state, formAction] = useFormState(createSession, initialState);

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">New Session</h1>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input name="title" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input name="time" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Venue</label>
          <input name="venue" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input name="price" type="text" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spots</label>
          <input name="spots" type="number" required className="w-full border rounded p-2" />
        </div>
        <RosterMultiSelect ownerId="owner1" maxPlayers={20} />
        {state.message && (
          <p className="text-red-600">{state.message}</p>
        )}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Create
        </button>
      </form>
    </main>
  );
}

