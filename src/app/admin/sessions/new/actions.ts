"use server";

import { getSupabase } from "@/lib/supabaseClient";

export type FormState = {
  message: string | null;
  id?: number;
};

export async function createSession(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = getSupabase();
  const title = ((formData.get("title") as string) || "").trim();
  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const time = endTime ? `${date} ${startTime}-${endTime}` : `${date} ${startTime}`;
  const venue = ((formData.get("venue") as string) || "").trim();
  const parseNumberField = (value: FormDataEntryValue | null): number | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  };
  const minPlayers = parseNumberField(formData.get("minPlayers"));
  const maxPlayers = parseNumberField(formData.get("maxPlayers"));
  const message = ((formData.get("message") as string) || "").replace(/\n/g, " ").trim() || null;

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      title: title || null,
      venue: venue || null,
      time,
      min_players: minPlayers,
      max_players: maxPlayers,
      message,
    })
    .select("id")
    .single();

  if (error) {
    return { message: error.message };
  }

  return { message: null, id: data.id };
}

