"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import SessionForm, {
  type SessionFormValues,
} from "../../components/SessionForm";
import { createSession, type FormState } from "../actions";

const storageKey = "sessionForm";

export default function SchedulePage() {
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<SessionFormValues>({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    minPlayers: "",
    maxPlayers: "",
    message: "",
  });

  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setInitialValues((prev) => ({
          ...prev,
          title: data.title || "",
          date: data.date || "",
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          venue: data.venue || data.location || "",
        }));
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  const handleSuccess = useCallback(
    (state: FormState) => {
      if (!state.message && state.id) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(storageKey);
        }
        router.replace(`/admin/sessions?new=${state.id}`);
      }
    },
    [router]
  );

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Schedule Session</h1>
      <SessionForm
        initial={initialValues}
        action={createSession}
        submitLabel="Create Session"
        primaryReadOnly
        onSuccess={handleSuccess}
      />
    </main>
  );
}
