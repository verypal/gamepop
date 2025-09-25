"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export type UpdateSessionState = {
  message: string | null;
  success: boolean;
};

const successState: UpdateSessionState = { message: null, success: true };
const errorState = (message: string): UpdateSessionState => ({
  message,
  success: false,
});

export async function updateSession(
  _prevState: UpdateSessionState,
  formData: FormData
): Promise<UpdateSessionState> {
  const supabase = getSupabase();
  const id = ((formData.get("id") as string) || "").trim();
  if (!id) {
    return errorState("Missing session id");
  }

  const title = ((formData.get("title") as string) || "").trim();
  const time = ((formData.get("time") as string) || "").trim() || null;
  const venue = ((formData.get("venue") as string) || "").trim() || null;
  const parseNumber = (value: FormDataEntryValue | null) => {
    if (value === null) return null;
    const asString = String(value).trim();
    if (!asString) return null;
    return Number(asString);
  };

  const minPlayers = parseNumber(formData.get("minPlayers"));
  const maxPlayers = parseNumber(formData.get("maxPlayers"));
  const message = ((formData.get("message") as string) || "").trim() || null;

  if (Number.isNaN(minPlayers) || Number.isNaN(maxPlayers)) {
    return errorState("Player counts must be numbers");
  }

  const { error } = await supabase
    .from("sessions")
    .update({
      title: title || null,
      time,
      venue,
      min_players: minPlayers,
      max_players: maxPlayers,
      message,
    })
    .eq("id", id);

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/admin/sessions");
  revalidatePath(`/admin/sessions/${id}/edit`);

  return successState;
}

export async function deleteSession(formData: FormData): Promise<void> {
  const supabase = getSupabase();
  const id = ((formData.get("id") as string) || "").trim();
  if (!id) {
    throw new Error("Missing session id");
  }

  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/sessions");
  redirect("/admin/sessions");
}
