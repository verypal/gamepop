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
    <main className="min-h-screen px-6 py-8 max-w-md mx-auto space-y-8">
      <section className="space-y-4 rounded-2xl border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold">
          {session.title ?? `Session ${session.id}`}
        </h1>
        <h2 className="text-base font-semibold text-gray-900">Event details</h2>
        <div className="space-y-1 text-sm text-gray-600">
          <p>{session.time}</p>
          {session.venue && <p>Venue: {session.venue}</p>}
          <p>
            Players: {session.min_players ?? 0}-{session.max_players ?? 0}
          </p>
        </div>
        {session.message && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
            <p>{session.message}</p>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900">Player actions</h2>
        <div className="space-y-3">
          <CheckoutButton sessionId={id} />
          <button className="w-full rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700">
            View Policy
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900">Player RSVP</h2>
        <form className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700" htmlFor="rsvp-email">
              Email
            </label>
            <input
              id="rsvp-email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Join Waitlist
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900">Admin actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/sessions/${id}/edit`}
            className="rounded border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Edit session
          </Link>
          <form action={deleteSession} className="contents">
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded border border-red-600 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete session
            </button>
          </form>
        </div>
      </section>

      <p className="text-center text-xs text-gray-400">
        Session ID: <code>{id}</code>
      </p>
    </main>
  );
}
