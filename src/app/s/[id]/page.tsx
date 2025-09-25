import { cookies } from "next/headers";
import Link from "next/link";

import RSVPControls from "@/components/RSVPControls";
import { deleteSession } from "@/app/admin/sessions/actions";
import { getSupabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic"; // ⬅️ stop static prerender

type SessionResponse = {
  id: string;
  player_name: string;
  player_name_search?: string | null;
  email: string | null;
  phone_whatsapp: string | null;
  preferred_contact: "email" | "phone" | null;
  status: "in" | "out" | "maybe" | null;
  updated_at: string | null;
};

type SessionRecord = {
  id: string;
  title: string | null;
  time: string | null;
  venue: string | null;
  min_players: number | null;
  max_players: number | null;
  message: string | null;
  require_contact?: boolean | null;
  session_responses?: SessionResponse[] | null;
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: session, error } = await supabase
    .from("sessions")
    .select(
      `id, title, time, venue, min_players, max_players, message, require_contact, session_responses(id, player_name, player_name_search, email, phone_whatsapp, preferred_contact, status, updated_at)`,
    )
    .eq("id", id)
    .single<SessionRecord>();

  if (error || !session) {
    return <p className="p-6">Session not found</p>;
  }

  const sessionResponses = session.session_responses ?? [];
  const cookieStore = cookies();
  const responseCookieKey = `session-rsvp-${id}`;
  const savedContactKey = cookieStore.get(responseCookieKey)?.value;

  const initialResponse = savedContactKey
    ? sessionResponses.find((response) => {
        const contactKey =
          response.email?.toLowerCase() ??
          response.phone_whatsapp?.toLowerCase() ??
          response.player_name_search ??
          response.player_name?.toLowerCase() ??
          null;
        return contactKey === savedContactKey;
      }) ?? null
    : null;

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-1">{session.title ?? `Session ${session.id}`}</h1>
      <p className="text-sm text-gray-600">{session.time}</p>
      {session.venue && <p className="text-sm text-gray-600">Venue: {session.venue}</p>}
      <p className="text-sm text-gray-600 mb-4">
        Players: {session.min_players ?? 0}-{session.max_players ?? 0}
      </p>
      {session.message && (
        <div className="rounded-2xl border p-4 mb-4">
          <p>{session.message}</p>
        </div>
      )}

      <RSVPControls
        sessionId={id}
        initialResponse={
          initialResponse
            ? {
                player_name: initialResponse.player_name,
                email: initialResponse.email,
                phone_whatsapp: initialResponse.phone_whatsapp,
                preferred_contact: initialResponse.preferred_contact,
                status: initialResponse.status,
              }
            : null
        }
        requireContact={Boolean(session.require_contact)}
      />

      <div className="mt-6 space-y-3 border-t pt-4">
        <p className="text-sm font-medium text-gray-700">Admin actions</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/sessions/${id}/edit`}
            className="rounded border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600"
          >
            Edit session
          </Link>
          <form action={deleteSession}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded border border-red-600 px-3 py-2 text-sm font-medium text-red-600"
            >
              Delete session
            </button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">Session ID: <code>{id}</code></p>
    </main>
  );
}
