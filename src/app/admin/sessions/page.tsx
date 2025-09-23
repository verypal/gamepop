import Link from "next/link";
import { headers } from "next/headers";
import { getSupabase } from "@/lib/supabaseClient";
import CopyToClipboard from "@/components/CopyToClipboard";
import { buildShareText, type SessionRow } from "@/lib/shareText";

export const dynamic = "force-dynamic";  // ⬅️ stop static prerender at build

const PAGE_SIZE = 10;

export default async function AdminSessions({
  searchParams,
}: {
  searchParams: { new?: string; page?: string };
}) {
  const supabase = getSupabase(); // ⬅️ create client at request time
  const pageParam = Number.parseInt(searchParams?.page ?? "1", 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const offset = (page - 1) * PAGE_SIZE;
  const { data: sessions, error, count } = await supabase
    .from("sessions")
    .select("id, title, venue, time, min_players, max_players, message", {
      count: "exact",
    })
    .order("time", { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    return <main className="p-6">Error loading sessions: {error.message}</main>;
  }
  const highlightId = searchParams?.new;
  const totalCount = count ?? 0;
  const start = totalCount === 0 ? 0 : Math.min(offset + 1, totalCount);
  const end =
    totalCount === 0
      ? 0
      : sessions && sessions.length > 0
        ? offset + sessions.length
        : Math.min(offset + PAGE_SIZE, totalCount);
  const sessionList = sessions ?? [];
  const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / PAGE_SIZE);
  const activePage = Math.max(1, Math.min(page, totalPages));
  const hasSessions = sessionList.length > 0;
  const paginationBaseParams = new URLSearchParams();
  if (highlightId) {
    paginationBaseParams.set("new", highlightId);
  }
  const buildPageHref = (pageNumber: number) => {
    const params = new URLSearchParams(paginationBaseParams);
    if (pageNumber > 1) {
      params.set("page", pageNumber.toString());
    } else {
      params.delete("page");
    }
    const query = params.toString();
    return query ? `/admin/sessions?${query}` : "/admin/sessions";
  };
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
        className="inline-block mb-2 text-blue-600 underline"
      >
        Add new session
      </Link>
      <p className="mb-4 text-sm text-gray-700">
        {`Showing ${start}–${end} of ${totalCount} sessions`}
      </p>
      {!hasSessions ? (
        <p className="text-sm text-gray-700">
          {totalCount === 0 ? (
            <>
              No sessions yet.{" "}
              <Link href="/admin/sessions/new" className="text-blue-600 underline">
                Add one
              </Link>
              .
            </>
          ) : (
            "No sessions on this page."
          )}
        </p>
      ) : (
        <ul className="space-y-3">
          {sessionList.map((s: SessionRow) => {
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
      )}
      <nav className="mt-6 flex items-center justify-between text-sm">
        <Link
          href={buildPageHref(Math.max(1, activePage - 1))}
          className={`rounded border px-3 py-2 ${
            activePage <= 1
              ? "pointer-events-none border-gray-200 text-gray-400"
              : "border-gray-300 text-blue-600"
          }`}
          aria-disabled={activePage <= 1}
        >
          Previous
        </Link>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <Link
                key={pageNumber}
                href={buildPageHref(pageNumber)}
                className={`rounded border px-3 py-2 ${
                  pageNumber === activePage
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-300 text-blue-600"
                }`}
                aria-current={pageNumber === activePage ? "page" : undefined}
              >
                {pageNumber}
              </Link>
            );
          })}
        </div>
        <Link
          href={buildPageHref(Math.min(totalPages, activePage + 1))}
          className={`rounded border px-3 py-2 ${
            activePage >= totalPages || totalCount === 0
              ? "pointer-events-none border-gray-200 text-gray-400"
              : "border-gray-300 text-blue-600"
          }`}
          aria-disabled={activePage >= totalPages || totalCount === 0}
        >
          Next
        </Link>
      </nav>
    </main>
  );
}
