import { notFound } from "next/navigation";

import { getSupabase } from "@/lib/supabaseClient";

import EditSessionForm from "../../components/EditSessionForm";
import type { SessionFormValues } from "../../components/SessionForm";

export const dynamic = "force-dynamic";

function parseTime(value: string | null): Pick<SessionFormValues, "date" | "startTime" | "endTime"> {
  if (!value) {
    return { date: "", startTime: "", endTime: "" };
  }
  const [datePart, timePart] = value.split(" ");
  if (!timePart) {
    return { date: datePart ?? "", startTime: "", endTime: "" };
  }
  const [start, end] = timePart.split("-");
  return {
    date: datePart ?? "",
    startTime: start ?? "",
    endTime: end ?? "",
  };
}

export default async function EditSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const sessionId = Number(params.id);
  if (!sessionId || Number.isNaN(sessionId)) {
    notFound();
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, title, venue, time, min_players, max_players, message")
    .eq("id", sessionId)
    .single();

  if (error || !data) {
    notFound();
  }

  const timeParts = parseTime(data.time ?? null);

  const initialValues: SessionFormValues = {
    title: data.title ?? "",
    venue: data.venue ?? "",
    message: data.message ?? "",
    minPlayers: data.min_players != null ? String(data.min_players) : "",
    maxPlayers: data.max_players != null ? String(data.max_players) : "",
    ...timeParts,
  };

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Session</h1>
      <EditSessionForm sessionId={data.id} initialValues={initialValues} />
    </main>
  );
}
