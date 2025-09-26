"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ContactType,
  ResponseStatus,
  SessionResponse,
} from "@/lib/types";

const STORAGE_KEY_PREFIX = "rsvp-response:";

type StoredResponse = {
  playerName: string;
  email: string;
  phoneWhatsapp: string;
  preferredContact: ContactType | null;
  status: ResponseStatus | null;
};

type RsvpControlsProps = {
  sessionId: string;
  initialResponses: SessionResponse[];
};

type StatusConfig = {
  buttonLabel: string;
  bannerText: string;
  bannerClasses: string;
};

const statusConfigs: Record<ResponseStatus, StatusConfig> = {
  in: {
    buttonLabel: "I'm in",
    bannerText: "You're in! See you there.",
    bannerClasses: "bg-green-50 border-green-500 text-green-700",
  },
  maybe: {
    buttonLabel: "Maybe",
    bannerText: "Maybe works! We'll keep you in the loop.",
    bannerClasses: "bg-amber-50 border-amber-500 text-amber-700",
  },
  out: {
    buttonLabel: "Can't make it",
    bannerText: "No worries! We've marked you as out.",
    bannerClasses: "bg-slate-50 border-slate-400 text-slate-700",
  },
};

function loadStoredResponse(sessionId: string): StoredResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${sessionId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredResponse;
    if (!parsed.playerName) return null;
    return parsed;
  } catch (error) {
    console.warn("Failed to load stored RSVP response", error);
    return null;
  }
}

function storeResponse(sessionId: string, response: StoredResponse) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${sessionId}`,
      JSON.stringify(response)
    );
  } catch (error) {
    console.warn("Failed to persist RSVP response", error);
  }
}

function formatPlayerName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "Anonymous";
  const parts = trimmed.split(/\s+/);
  const first = parts[0];
  if (parts.length === 1) {
    return capitalize(first);
  }
  const last = parts[parts.length - 1];
  const initial = last[0] ? `${last[0].toUpperCase()}.` : "";
  return `${capitalize(first)}${initial ? ` ${initial}` : ""}`;
}

function capitalize(value: string): string {
  if (!value) return value;
  return value[0].toUpperCase() + value.slice(1);
}

function sortResponses(responses: SessionResponse[]) {
  return [...responses].sort((a, b) =>
    a.player_name.localeCompare(b.player_name, undefined, {
      sensitivity: "base",
    })
  );
}

export default function RsvpControls({
  sessionId,
  initialResponses,
}: RsvpControlsProps) {
  const [playerName, setPlayerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<ContactType | null>(
    null
  );
  const [responses, setResponses] = useState(() => sortResponses(initialResponses));
  const [latestStatus, setLatestStatus] = useState<ResponseStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStoredResponse(sessionId);
    if (stored) {
      setPlayerName(stored.playerName ?? "");
      setEmail(stored.email ?? "");
      setPhone(stored.phoneWhatsapp ?? "");
      setPreferredContact(stored.preferredContact ?? null);
      setLatestStatus(stored.status ?? null);
    }
  }, [sessionId]);

  useEffect(() => {
    setPreferredContact((current) => {
      if (current === "email" && !email) return null;
      if (current === "phone_whatsapp" && !phone) return null;
      return current;
    });
  }, [email, phone]);

  const groupedResponses = useMemo(() => {
    const buckets: Record<ResponseStatus, SessionResponse[]> = {
      in: [],
      maybe: [],
      out: [],
    };

    for (const response of responses) {
      const status = (response.status as ResponseStatus) ?? "out";
      if (status === "in" || status === "maybe" || status === "out") {
        buckets[status].push(response);
      }
    }

    return buckets;
  }, [responses]);

  const selectedContact = useMemo<ContactType | null>(() => {
    if (preferredContact) return preferredContact;
    if (email && !phone) return "email";
    if (phone && !email) return "phone_whatsapp";
    return null;
  }, [preferredContact, email, phone]);

  const handleSubmit = useCallback(
    async (status: ResponseStatus) => {
      if (!playerName.trim()) {
        setError("Please add your name before responding.");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      const previousStatus = latestStatus;
      setLatestStatus(status);

      const payload = {
        playerName: playerName.trim(),
        email: email.trim() || undefined,
        phoneWhatsapp: phone.trim() || undefined,
        preferredContact: selectedContact ?? undefined,
        status,
      };

      let optimisticId: string | null = null;
      const optimisticResponse: SessionResponse = (() => {
        const existing = responses.find((r) => r.player_name === payload.playerName);
        if (existing) {
          optimisticId = existing.id;
          return { ...existing, status };
        }

        optimisticId = `temp-${Date.now()}`;
        return {
          id: optimisticId,
          session_id: sessionId,
          player_name: payload.playerName,
          player_name_search: payload.playerName.toLowerCase(),
          email: payload.email ?? null,
          phone_whatsapp: payload.phoneWhatsapp ?? null,
          preferred_contact: payload.preferredContact ?? null,
          status,
          updated_at: new Date().toISOString(),
        };
      })();

      setResponses((prev) => {
        const existingIndex = prev.findIndex((response) => response.id === optimisticId);
        if (existingIndex === -1) {
          return sortResponses([...prev, optimisticResponse]);
        }

        const updated = [...prev];
        updated[existingIndex] = optimisticResponse;
        return sortResponses(updated);
      });

      try {
        const response = await fetch(`/api/sessions/${sessionId}/rsvp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(body.error || "Failed to save RSVP");
        }

        const data = (await response.json()) as SessionResponse;
        setResponses((prev) => {
          const withoutTemp = prev.filter((item) => item.id !== optimisticId);
          const existingIndex = prev.findIndex((item) => item.id === data.id);
          if (existingIndex === -1) {
            return sortResponses([...withoutTemp, data]);
          }
          const updated = [...withoutTemp];
          updated[existingIndex] = data;
          return sortResponses(updated);
        });

        const stored: StoredResponse = {
          playerName: payload.playerName,
          email: payload.email ?? "",
          phoneWhatsapp: payload.phoneWhatsapp ?? "",
          preferredContact: payload.preferredContact ?? null,
          status,
        };
        storeResponse(sessionId, stored);
      } catch (submitError) {
        setLatestStatus(previousStatus ?? null);
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Something went wrong"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      email,
      latestStatus,
      phone,
      playerName,
      responses,
      selectedContact,
      sessionId,
    ]
  );

  const bannerStatus = latestStatus && statusConfigs[latestStatus];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="player-name">
            Your name
          </label>
          <input
            id="player-name"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="Taylor Swift"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="player-email">
              Email <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="player-email"
              type="email"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="taylor@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="player-phone">
              WhatsApp <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="player-phone"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="+61 400 000 000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="preferred-contact">
            Preferred contact <span className="text-gray-400">(optional)</span>
          </label>
          <select
            id="preferred-contact"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={selectedContact ?? ""}
            onChange={(event) =>
              setPreferredContact(
                event.target.value
                  ? (event.target.value as ContactType)
                  : null
              )
            }
            disabled={isSubmitting || (!email && !phone)}
          >
            <option value="">No preference</option>
            <option value="email" disabled={!email}>
              Email
            </option>
            <option value="phone_whatsapp" disabled={!phone}>
              WhatsApp
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">RSVP</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(statusConfigs) as ResponseStatus[]).map((status) => {
              const config = statusConfigs[status];
              const isSelected = latestStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition hover:border-gray-900 ${
                    isSelected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 text-gray-700"
                  }`}
                  onClick={() => handleSubmit(status)}
                  disabled={isSubmitting}
                >
                  {config.buttonLabel}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {bannerStatus && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${bannerStatus.bannerClasses}`}
        >
          {bannerStatus.bannerText}
        </div>
      )}

      <div className="space-y-4">
        {([
          ["Attending", groupedResponses.in],
          ["Maybe", groupedResponses.maybe],
          ["Not Attending", groupedResponses.out],
        ] as const).map(([title, list]) => (
          <div key={title}>
            <p className="text-sm font-semibold text-gray-700">{title}</p>
            {list.length === 0 ? (
              <p className="text-sm text-gray-500">No one yet.</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {list.map((item) => (
                  <li key={item.id} className="text-sm text-gray-700">
                    {formatPlayerName(item.player_name)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
