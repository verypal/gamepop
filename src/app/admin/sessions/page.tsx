import Link from "next/link";
import { headers } from "next/headers";
import { getSupabase } from "@/lib/supabaseClient";
import CopyToClipboard from "@/components/CopyToClipboard";
import { buildShareText, type SessionRow } from "@/lib/shareText";

export const dynamic = "force-dynamic";  // ⬅️ stop static prerender at build

export default async function AdminSessions() {
  const supabase = getSupabase();  // ⬅️ create client at request time
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, title, time, venue, price, spots_left, roster");

  if (error) {
    return <main className="p-6">Error loading sessions: {error.message}</main>;
  }
  if (!sessions || sessions.length === 0) {
    return (
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Admin — Sessions</h1>
        <p>No sessions yet. Add one in Supabase Table Editor.</p>
      </main>
    );
  }
  // headers() is synchronous
  const hdrs = headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin — Sessions</h1>
      <ul className="space-y-3">
        {sessions.map((s: SessionRow) => {
          const share = buildShareText(s, origin + "/s/" + s.id);
          return (
            <li key={s.id} className="rounded-2xl border p-4">
              <Link href={`/s/${s.id}`} className="block">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-medium">{s.title}</h2>
                  <span className="text-sm text-gray-600">{s.spots_left ?? 0} left</span>
                </div>
                <p className="text-sm text-gray-600">
                  {s.time} • {s.venue}
                </p>
                {s.roster?.length ? (
                  <p className="text-xs text-gray-500 mt-1">✅ {s.roster.join(", ")}</p>
                ) : null}
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
