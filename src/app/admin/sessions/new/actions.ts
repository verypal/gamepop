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
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const venue = formData.get("venue") as string;
  const time = endTime ? `${date} ${startTime}-${endTime}` : `${date} ${startTime}`;
  const price = formData.get("price") as string;
  const spots = Number(formData.get("spots"));
  const minPlayers = Number(formData.get("minPlayers"));
  const maxPlayers = Number(formData.get("maxPlayers"));
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
      min_players: minPlayers,
      max_players: maxPlayers,
    })
    .select("id")
    .single();

  if (error) {
    let message = error.message;
    if (error.code === "23502") {
      if (error.message.includes("min_players")) {
        message = "Minimum players is required.";
      } else if (error.message.includes("max_players")) {
        message = "Maximum players is required.";
      }
    } else if (error.code === "23514") {
      if (error.message.includes("sessions_min_players_check")) {
        message = "Minimum players must be at least 1.";
      } else if (error.message.includes("sessions_max_players_ge_min")) {
        message = "Maximum players must be at least the minimum.";
      } else if (error.message.includes("sessions_max_players_le_100")) {
        message = "Maximum players must be 100 or fewer.";
      }
    }
    return { message };
  }

  return { message: null, id: data.id };
}

