"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  deleteSession,
  updateSession,
  type UpdateSessionState,
} from "../actions";

export type SessionFormProps = {
  sessionId?: string;
  defaultValues: {
    title: string | null;
    time: string | null;
    venue: string | null;
    min_players: number | null;
    max_players: number | null;
    message: string | null;
  };
};

const initialState: UpdateSessionState = { message: null, success: false };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Deleting..." : "Delete session"}
    </button>
  );
}

export function EditSessionForm({ sessionId, defaultValues }: SessionFormProps) {
  const [state, formAction] = useFormState(updateSession, initialState);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    setShowSuccess(false);
    return undefined;
  }, [state.success]);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {sessionId ? <input type="hidden" name="id" value={sessionId} /> : null}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={defaultValues.title ?? ""}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium mb-1">
            Time
          </label>
          <input
            id="time"
            name="time"
            defaultValue={defaultValues.time ?? ""}
            className="w-full border rounded p-2"
            placeholder="2024-05-01 18:00-20:00"
          />
        </div>
        <div>
          <label htmlFor="venue" className="block text-sm font-medium mb-1">
            Venue
          </label>
          <input
            id="venue"
            name="venue"
            defaultValue={defaultValues.venue ?? ""}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="minPlayers" className="block text-sm font-medium mb-1">
              Minimum players
            </label>
            <input
              id="minPlayers"
              name="minPlayers"
              type="number"
              defaultValue={
                defaultValues.min_players === null
                  ? ""
                  : defaultValues.min_players
              }
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label htmlFor="maxPlayers" className="block text-sm font-medium mb-1">
              Maximum players
            </label>
            <input
              id="maxPlayers"
              name="maxPlayers"
              type="number"
              defaultValue={
                defaultValues.max_players === null
                  ? ""
                  : defaultValues.max_players
              }
              className="w-full border rounded p-2"
            />
          </div>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            defaultValue={defaultValues.message ?? ""}
            className="w-full border rounded p-2"
            rows={4}
          />
        </div>
        {state.message ? (
          <p className="text-sm text-red-600">{state.message}</p>
        ) : null}
        {showSuccess ? (
          <p className="text-sm text-green-600">Changes saved</p>
        ) : null}
        <SubmitButton label="Save changes" />
      </form>
      {sessionId ? (
        <form
          action={deleteSession}
          onSubmit={(event) => {
            if (!window.confirm("Delete this session?")) {
              event.preventDefault();
            }
          }}
          className="border-t pt-4"
        >
          <input type="hidden" name="id" value={sessionId} />
          <DeleteButton />
        </form>
      ) : null}
    </div>
  );
}

export default EditSessionForm;
