import CheckoutButton from "@/components/CheckoutButton";
import { getSupabase } from "@/lib/supabaseClient";

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

      <p className="mt-6 text-xs text-gray-400">Session ID: <code>{id}</code></p>
    </main>
  );
}
