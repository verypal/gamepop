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
  const paymentsEnabled = formData.get("paymentsEnabled") === "on";
  const priceStr = formData.get("price") as string | null;
  const currencyField = (formData.get("currency") as string) || "GBP";
  const spots = Number(formData.get("spots"));
  const rosterStr = (formData.get("roster") as string) || "";
  const roster = rosterStr
    ? rosterStr.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  let price: number | null = null;
  let currency: string | null = null;
  if (paymentsEnabled) {
    price = priceStr ? parseFloat(priceStr) : NaN;
    if (!price || price <= 0) {
      return { message: "Price must be greater than 0" };
    }
    currency = currencyField;
  }

  const sessionForm = {
    title,
    time,
    venue,
    payments_enabled: paymentsEnabled,
    price,
    currency,
    spots_left: spots,
    roster,
  };

  const { data, error } = await supabase
    .from("sessions")
    .insert(sessionForm)
    .select("id")
    .single();

  if (error) {
    return { message: error.message };
  }

  redirect(`/admin/sessions?new=${data.id}`);
  return { message: null };
}

