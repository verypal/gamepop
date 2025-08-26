"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createSession, type FormState } from "./actions";

const initialState: FormState = { message: null };

export default function NewSessionPage() {
  const [state, formAction] = useFormState(createSession, initialState);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);

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
        <div className="flex items-center">
          <input
            id="paymentsEnabled"
            name="paymentsEnabled"
            type="checkbox"
            className="mr-2"
            checked={paymentsEnabled}
            onChange={(e) => setPaymentsEnabled(e.target.checked)}
          />
          <label htmlFor="paymentsEnabled" className="text-sm font-medium">
            Collect payments
          </label>
        </div>
        {paymentsEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                required={paymentsEnabled}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <input
                name="currency"
                defaultValue="GBP"
                required={paymentsEnabled}
                className="w-full border rounded p-2"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Spots</label>
          <input name="spots" type="number" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Roster (comma-separated)</label>
          <input name="roster" className="w-full border rounded p-2" />
        </div>
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

