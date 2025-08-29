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
  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const time = endTime ? `${date} ${startTime}-${endTime}` : `${date} ${startTime}`;
  const minPlayers = Number(formData.get("minPlayers"));
  const maxPlayers = Number(formData.get("maxPlayers"));
  const message = ((formData.get("message") as string) || "").replace(/\n/g, " ").trim() || null;

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      time,
      min_players: isNaN(minPlayers) ? null : minPlayers,
      max_players: isNaN(maxPlayers) ? null : maxPlayers,
      message,
    })
    .select("id")
    .single();

  if (error) {
    return { message: error.message };
  }

  return { message: null, id: data.id };
}

