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
    return { message: error.message };
  }

  return { message: null, id: data.id };
}

