import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import CheckoutButton from "@/components/CheckoutButton";


export default async function SessionPage({ params }: { params: { id: string } }) {
  const { id } = params;

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
      <h1 className="text-2xl font-semibold mb-1">{session.title}</h1>
      <p className="text-sm text-gray-600">{session.time}</p>
      <p className="text-sm text-gray-600 mb-4">{session.venue}</p>

      <div className="rounded-2xl border p-4 mb-4">
        <p className="mb-1">Price: <strong>{session.price}</strong></p>
        <p className="mb-2">Spots left: <strong>{session.spots_left}</strong></p>
        <p className="text-sm text-gray-600">
          Confirmed: {session.roster?.map((n: string) => `✅ ${n}`).join(", ")}
        </p>
      </div>

      <div className="space-y-2">
        <CheckoutButton sessionId={id} />   {/* 👈 replaces the mock link */}
        <button className="w-full rounded-xl border py-3">Join Waitlist</button>
        <button className="w-full text-gray-500 text-sm">View Policy</button>
      </div>


      <p className="mt-6 text-xs text-gray-400">
        Session ID: <code>{id}</code>
      </p>
    </main>
  );
}
