"use client";

import { type FormEvent, useCallback, useMemo, useState } from "react";

type Props = {
  sessionId: string;
};

type FormState = {
  playerName: string;
  email: string;
  phoneWhatsapp: string;
  preferredContact: "" | "email" | "phone_whatsapp";
  status: "" | "in" | "out" | "maybe";
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; created: boolean }
  | { status: "error"; message: string };

const initialFormState: FormState = {
  playerName: "",
  email: "",
  phoneWhatsapp: "",
  preferredContact: "",
  status: "",
};

export default function RsvpForm({ sessionId }: Props) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const onChange = useCallback(<T extends keyof FormState>(field: T, value: FormState[T]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSubmitState({ status: "idle" });
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialFormState);
    setSubmitState({ status: "idle" });
  }, []);

  const submitLabel = useMemo(() => {
    if (submitState.status === "submitting") return "Sending...";
    if (submitState.status === "success") {
      return submitState.created ? "RSVP created" : "RSVP updated";
    }
    return "Submit RSVP";
  }, [submitState]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.playerName.trim()) {
      setSubmitState({ status: "error", message: "Player name is required" });
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch(`/api/sessions/${sessionId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName: form.playerName,
          email: form.email,
          phoneWhatsapp: form.phoneWhatsapp,
          preferredContact: form.preferredContact || undefined,
          status: form.status || undefined,
        }),
      });

      if (!response.ok) {
        const errorJson = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        const message = errorJson?.error || "Something went wrong";
        setSubmitState({ status: "error", message });
        return;
      }

      const created = response.status === 201;
      setSubmitState({ status: "success", created });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSubmitState({ status: "error", message });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="playerName">
          Player name
        </label>
        <input
          id="playerName"
          name="playerName"
          type="text"
          required
          value={form.playerName}
          onChange={(event) => onChange("playerName", event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Ash Ketchum"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
          Email (optional)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={(event) => onChange("email", event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="ash@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="phoneWhatsapp">
          WhatsApp (optional)
        </label>
        <input
          id="phoneWhatsapp"
          name="phoneWhatsapp"
          type="tel"
          value={form.phoneWhatsapp}
          onChange={(event) => onChange("phoneWhatsapp", event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="+65 1234 5678"
        />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">Preferred contact</span>
        <select
          name="preferredContact"
          value={form.preferredContact}
          onChange={(event) => onChange("preferredContact", event.target.value as FormState["preferredContact"])}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="">No preference</option>
          <option value="email">Email</option>
          <option value="phone_whatsapp">WhatsApp</option>
        </select>
      </div>

      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-gray-700">
          Status
        </legend>
        <div className="flex flex-wrap gap-3">
          {[
            { value: "in", label: "In" },
            { value: "maybe", label: "Maybe" },
            { value: "out", label: "Out" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={form.status === option.value}
                onChange={(event) => onChange("status", event.target.value as FormState["status"])}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {submitState.status === "error" && (
        <p className="text-sm text-red-600">{submitState.message}</p>
      )}

      {submitState.status === "success" && (
        <p className="text-sm text-green-600">
          {submitState.created ? "RSVP created!" : "RSVP updated!"}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
          disabled={submitState.status === "submitting"}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="text-sm text-gray-600 underline"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
