"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ResponseStatus = "in" | "out" | "maybe";

type ContactPreference = "email" | "phone" | null;

type SessionResponse = {
  player_name: string;
  email: string | null;
  phone_whatsapp: string | null;
  preferred_contact: ContactPreference;
  status: ResponseStatus | null;
};

type RSVPControlsProps = {
  sessionId: string;
  initialResponse: SessionResponse | null;
  requireContact?: boolean;
};

type StoredResponse = {
  playerName: string;
  email: string;
  phone: string;
  status: ResponseStatus | null;
  preferredContact: ContactPreference;
};

const storageKeyFor = (sessionId: string) => `session:${sessionId}:rsvp`;

function parseStoredResponse(value: string | null): StoredResponse | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredResponse>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return {
      playerName: typeof parsed.playerName === "string" ? parsed.playerName : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      status:
        parsed.status === "in" || parsed.status === "out" || parsed.status === "maybe"
          ? parsed.status
          : null,
      preferredContact:
        parsed.preferredContact === "email" || parsed.preferredContact === "phone"
          ? parsed.preferredContact
          : null,
    } satisfies StoredResponse;
  } catch (error) {
    console.warn("Could not parse stored RSVP response", error);
    return null;
  }
}

export default function RSVPControls({
  sessionId,
  initialResponse,
  requireContact = false,
}: RSVPControlsProps) {
  const [hydrated, setHydrated] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<ResponseStatus | null>(null);
  const [preferredContact, setPreferredContact] = useState<ContactPreference>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const storageKey = useMemo(() => storageKeyFor(sessionId), [sessionId]);

  useEffect(() => {
    const stored = parseStoredResponse(
      typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null,
    );

    if (stored) {
      setPlayerName(stored.playerName ?? "");
      setEmail(stored.email ?? "");
      setPhone(stored.phone ?? "");
      setStatus(stored.status ?? null);
      setPreferredContact(stored.preferredContact ?? null);
    } else if (initialResponse) {
      setPlayerName(initialResponse.player_name ?? "");
      setEmail(initialResponse.email ?? "");
      setPhone(initialResponse.phone_whatsapp ?? "");
      setStatus(initialResponse.status ?? null);
      setPreferredContact(initialResponse.preferred_contact ?? null);
    }

    setHydrated(true);
  }, [initialResponse, storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const payload: StoredResponse = {
      playerName,
      email,
      phone,
      status,
      preferredContact,
    };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (error) {
      console.warn("Unable to persist RSVP response", error);
    }
  }, [email, phone, playerName, preferredContact, status, storageKey, hydrated]);

  const confirmationMessage = useMemo(() => {
    if (status === "in") {
      return "✅ You’re in!";
    }
    if (status === "out") {
      return "☑️ You’re out for now.";
    }
    if (status === "maybe") {
      return "🤔 You’re a maybe.";
    }
    return null;
  }, [status]);

  const handleSubmit = useCallback(
    async (nextStatus: ResponseStatus) => {
      const trimmedName = playerName.trim();
      const trimmedEmail = email.trim();
      const trimmedPhone = phone.trim();
      const contactPreference: ContactPreference = trimmedEmail
        ? "email"
        : trimmedPhone
        ? "phone"
        : null;

      if (!trimmedName) {
        setError("Please enter your name to RSVP.");
        return;
      }

      if (requireContact && !trimmedEmail && !trimmedPhone) {
        setError("Please add an email or WhatsApp number so we can reach you.");
        return;
      }

      setPending(true);
      setError(null);

      try {
        const response = await fetch(`/api/sessions/${sessionId}/rsvp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerName: trimmedName,
            email: trimmedEmail || null,
            phone: trimmedPhone || null,
            preferredContact: contactPreference,
            status: nextStatus,
          }),
        });

        if (!response.ok) {
          const result = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(result?.message ?? "Unable to save your response. Please try again.");
        }

        setStatus(nextStatus);
        setPreferredContact(contactPreference);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setPending(false);
      }
    },
    [email, phone, playerName, requireContact, sessionId],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700" htmlFor="rsvp-name">
          Your name
        </label>
        <input
          id="rsvp-name"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Jane Doe"
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          disabled={pending}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700" htmlFor="rsvp-email">
          Email (optional)
        </label>
        <input
          id="rsvp-email"
          type="email"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700" htmlFor="rsvp-phone">
          WhatsApp (optional)
        </label>
        <input
          id="rsvp-phone"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="+1 555 123 4567"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={pending}
        />
      </div>

      {requireContact ? (
        <p className="text-xs text-gray-500">
          We need at least one contact method so we can follow up if plans change.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        {(
          [
            { label: "I’m in", value: "in" },
            { label: "I’m out", value: "out" },
            { label: "Maybe", value: "maybe" },
          ] as const
        ).map(({ label, value }) => {
          const isActive = status === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleSubmit(value)}
              disabled={pending}
              className={`flex-1 rounded-xl border px-4 py-3 text-center text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isActive
                  ? value === "in"
                    ? "border-green-600 bg-green-50 text-green-700 focus:ring-green-500"
                    : value === "out"
                    ? "border-red-500 bg-red-50 text-red-600 focus:ring-red-500"
                    : "border-yellow-500 bg-yellow-50 text-yellow-600 focus:ring-yellow-500"
                  : "border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-blue-500"
              } ${pending ? "opacity-70" : ""}`}
            >
              {pending && status !== value ? `${label}…` : label}
            </button>
          );
        })}
      </div>

      {confirmationMessage ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {confirmationMessage}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
