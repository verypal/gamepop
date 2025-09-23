"use server";

import { revalidatePath } from "next/cache";

import { getSupabase } from "@/lib/supabaseClient";

import type { FormState } from "./new/actions";

function parseNumberField(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function updateSession(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = getSupabase();

  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? Number(idValue) : NaN;
  if (!id || Number.isNaN(id)) {
    return { message: "Invalid session id" };
  }

  const title = ((formData.get("title") as string) || "").trim();
  const date = (formData.get("date") as string) ?? "";
  const startTime = (formData.get("startTime") as string) ?? "";
  const endTime = (formData.get("endTime") as string) ?? "";
  if (!date || !startTime) {
    return { message: "Date and start time are required" };
  }
  const time = endTime ? `${date} ${startTime}-${endTime}` : `${date} ${startTime}`;
  const venue = ((formData.get("venue") as string) || "").trim();
  const minPlayers = parseNumberField(formData.get("minPlayers"));
  const maxPlayers = parseNumberField(formData.get("maxPlayers"));
  const message =
    ((formData.get("message") as string) || "").replace(/\n/g, " ").trim() || null;

  const { error } = await supabase
    .from("sessions")
    .update({
      title: title || null,
      venue: venue || null,
      time,
      min_players: minPlayers,
      max_players: maxPlayers,
      message,
    })
    .eq("id", id);

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/admin/sessions");
  revalidatePath(`/s/${id}`);

  return { message: null, id };
}

export async function deleteSession(id: number): Promise<{ message: string | null }> {
  const supabase = getSupabase();
  const { error } = await supabase.from("sessions").delete().eq("id", id);

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/admin/sessions");
  revalidatePath(`/s/${id}`);

  return { message: null };
}
