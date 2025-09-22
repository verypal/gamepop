import Link from "next/link";
import { headers } from "next/headers";
import { getSupabase } from "@/lib/supabaseClient";
import CopyToClipboard from "@/components/CopyToClipboard";
import { buildShareText, type SessionRow } from "@/lib/shareText";

export const dynamic = "force-dynamic";  // ⬅️ stop static prerender at build

export default async function AdminSessions({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  const supabase = getSupabase(); // ⬅️ create client at request time
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, title, venue, time, min_players, max_players, message");

  if (error) {
    return <main className="p-6">Error loading sessions: {error.message}</main>;
  }
  const highlightId = searchParams?.new;
  if (!sessions || sessions.length === 0) {
    return (
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Admin — Sessions</h1>
        <p>
          No sessions yet.{' '}
          <Link href="/admin/sessions/new" className="text-blue-600 underline">
            Add one
          </Link>
          .
        </p>
      </main>
    );
  }
  //...const hdrs = headers(); //this is a promise
  const hdrs = await headers(); // ✅ resolve it
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host =
    hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin — Sessions</h1>
      <Link
        href="/admin/sessions/new"
        className="inline-block mb-4 text-blue-600 underline"
      >
        Add new session
      </Link>
      <ul className="space-y-3">
        {sessions.map((s: SessionRow) => {
          const share = buildShareText(s, origin + "/s/" + s.id);
          const highlight = highlightId === s.id;
          return (
            <li
              key={s.id}
              className={`rounded-2xl border p-4 ${highlight ? "border-blue-500 bg-blue-50" : ""}`}
            >
              <Link href={`/s/${s.id}`} className="block">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-medium">
                    {s.title ?? "Untitled session"}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {s.min_players ?? 0}-{s.max_players ?? 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{s.time}</p>
                {s.venue && (
                  <p className="text-sm text-gray-600">Venue: {s.venue}</p>
                )}
                {s.message && (
                  <p className="text-sm text-gray-600">{s.message}</p>
                )}
              </Link>
              <CopyToClipboard text={share} className="mt-2" />
              <a
                href={"https://wa.me/?text=" + encodeURIComponent(share)}
                target="_blank"
                className="block mt-1 text-sm text-blue-600 underline"
              >
                Open in WhatsApp
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
