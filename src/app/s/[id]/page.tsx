import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { getSupabase } from "@/lib/supabaseClient";
import { deleteSession } from "@/app/admin/sessions/actions";

export const dynamic = "force-dynamic";  // ⬅️ stop static prerender

export default async function SessionPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = getSupabase();        // ⬅️ create client inside

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !session) {
    return <p className="p-6">Session not found</p>;
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-1">
        {session.title ?? `Session ${session.id}`}
      </h1>
      <p className="text-sm text-gray-600">{session.time}</p>
      {session.venue && (
        <p className="text-sm text-gray-600">Venue: {session.venue}</p>
      )}
      <p className="text-sm text-gray-600 mb-4">
        Players: {session.min_players ?? 0}-{session.max_players ?? 0}
      </p>
      {session.message && (
        <div className="rounded-2xl border p-4 mb-4">
          <p>{session.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <CheckoutButton sessionId={id} />
        <button className="w-full rounded-xl border py-3">Join Waitlist</button>
        <button className="w-full text-gray-500 text-sm">View Policy</button>
      </div>

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
