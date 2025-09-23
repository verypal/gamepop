"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import type { FormState } from "../new/actions";

export type SessionFormValues = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  minPlayers: string;
  maxPlayers: string;
  message: string;
};

const INITIAL_FORM_STATE: FormState = { message: null };

function normalizeValues(values?: Partial<SessionFormValues>): SessionFormValues {
  return {
    title: values?.title ?? "",
    date: values?.date ?? "",
    startTime: values?.startTime ?? "",
    endTime: values?.endTime ?? "",
    venue: values?.venue ?? "",
    minPlayers: values?.minPlayers ?? "",
    maxPlayers: values?.maxPlayers ?? "",
    message: values?.message ?? "",
  };
}

export interface SessionFormProps {
  initial?: Partial<SessionFormValues>;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  sessionId?: number;
  onSuccess?: (state: FormState) => void;
  primaryReadOnly?: boolean;
}

export default function SessionForm({
  initial,
  action,
  submitLabel,
  sessionId,
  onSuccess,
  primaryReadOnly = false,
}: SessionFormProps) {
  const [state, dispatch] = useFormState(action, INITIAL_FORM_STATE);
  const [values, setValues] = useState<SessionFormValues>(
    normalizeValues(initial)
  );

  useEffect(() => {
    setValues(normalizeValues(initial));
  }, [initial]);

  useEffect(() => {
    if (!state.message && onSuccess) {
      onSuccess(state);
    }
  }, [state, onSuccess]);

  const handleChange = useCallback((field: keyof SessionFormValues) => {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
    };
  }, []);

  const dateInputType = primaryReadOnly ? "text" : "date";
  const timeInputType = primaryReadOnly ? "text" : "time";

  return (
    <form action={dispatch} className="space-y-4">
      {typeof sessionId === "number" && (
        <input type="hidden" name="id" value={sessionId} />
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={values.title}
          onChange={handleChange("title")}
          readOnly={primaryReadOnly}
          className={`w-full border rounded p-2 ${primaryReadOnly ? "bg-gray-100" : ""}`}
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          Date
        </label>
        <input
          id="date"
          name="date"
          type={dateInputType}
          value={values.date}
          onChange={handleChange("date")}
          readOnly={primaryReadOnly}
          className={`w-full border rounded p-2 ${primaryReadOnly ? "bg-gray-100" : ""}`}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium mb-1">
            Start Time
          </label>
          <input
            id="startTime"
            name="startTime"
            type={timeInputType}
            value={values.startTime}
            onChange={handleChange("startTime")}
            readOnly={primaryReadOnly}
            className={`w-full border rounded p-2 ${primaryReadOnly ? "bg-gray-100" : ""}`}
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium mb-1">
            End Time (optional)
          </label>
          <input
            id="endTime"
            name="endTime"
            type={timeInputType}
            value={values.endTime}
            onChange={handleChange("endTime")}
            readOnly={primaryReadOnly}
            className={`w-full border rounded p-2 ${primaryReadOnly ? "bg-gray-100" : ""}`}
          />
        </div>
      </div>
      <div>
        <label htmlFor="venue" className="block text-sm font-medium mb-1">
          Venue
        </label>
        <input
          id="venue"
          name="venue"
          value={values.venue}
          onChange={handleChange("venue")}
          readOnly={primaryReadOnly}
          className={`w-full border rounded p-2 ${primaryReadOnly ? "bg-gray-100" : ""}`}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="minPlayers" className="block text-sm font-medium mb-1">
            Minimum Players
          </label>
          <input
            id="minPlayers"
            name="minPlayers"
            type="number"
            value={values.minPlayers}
            onChange={handleChange("minPlayers")}
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
            value={values.maxPlayers}
            onChange={handleChange("maxPlayers")}
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
          value={values.message}
          onChange={handleChange("message")}
          className="w-full border rounded p-2"
          rows={4}
        />
      </div>
      {state.message && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        {submitLabel}
      </button>
    </form>
  );
}
