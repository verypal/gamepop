import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import { EditSessionForm } from "../../components/SessionForm";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("sessions")
    .select("id, title, time, venue, min_players, max_players, message")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.code === "PGRST103") {
      notFound();
    }
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Edit session</h1>
        <p className="text-sm text-gray-600">
          Update the session details below. Time is stored as free text, so keep
          the same format when editing.
        </p>
        <Link href="/admin/sessions" className="text-blue-600 underline text-sm">
          Back to sessions
        </Link>
      </div>
      <EditSessionForm sessionId={data.id} defaultValues={data} />
    </main>
  );
}
