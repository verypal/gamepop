import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export default function NewSessionPage() {
  async function createSession(formData: FormData) {
    "use server";
    const supabase = getSupabase();
    const title = formData.get("title") as string;
    const time = formData.get("time") as string;
    const venue = formData.get("venue") as string;
    const price = formData.get("price") as string;
    const spots = Number(formData.get("spots"));
    const rosterStr = (formData.get("roster") as string) || "";
    const roster = rosterStr
      ? rosterStr.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        title,
        time,
        venue,
        price,
        spots_left: spots,
        roster,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    redirect(`/admin/sessions?new=${data.id}`);
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">New Session</h1>
      <form action={createSession} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input name="title" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input name="time" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Venue</label>
          <input name="venue" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input name="price" type="text" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spots</label>
          <input name="spots" type="number" required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Roster (comma-separated)</label>
          <input name="roster" className="w-full border rounded p-2" />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Create
        </button>
      </form>
    </main>
  );
}
