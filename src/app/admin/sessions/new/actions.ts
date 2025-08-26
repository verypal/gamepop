"use server";

import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

export type FormState = {
  message: string | null;
};

export async function createSession(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
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
    return { message: error.message };
  }

  redirect(`/admin/sessions?new=${data.id}`);
  return { message: null };
}

