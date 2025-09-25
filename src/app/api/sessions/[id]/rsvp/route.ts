import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContactType, ResponseStatus, SessionResponse } from "@/lib/types";

function createSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars missing");
  }
  return createClient(url, key);
}

type RsvpRequestBody = {
  playerName?: unknown;
  email?: unknown;
  phoneWhatsapp?: unknown;
  preferredContact?: unknown;
  status?: unknown;
};

type NormalisedRsvp = {
  playerName: string;
  email: string | null;
  phoneWhatsapp: string | null;
  preferredContact: ContactType | null;
  status: ResponseStatus | null;
};

const validStatuses: ResponseStatus[] = ["in", "out", "maybe"];
const validContacts: ContactType[] = ["email", "phone_whatsapp"];

function normalise(body: RsvpRequestBody): NormalisedRsvp | null {
  const playerName = typeof body.playerName === "string" ? body.playerName.trim() : "";
  if (!playerName) return null;

  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const phoneRaw = typeof body.phoneWhatsapp === "string" ? body.phoneWhatsapp.trim() : "";
  const preferredRaw = typeof body.preferredContact === "string" ? body.preferredContact.trim() : "";
  const statusRaw = typeof body.status === "string" ? body.status.trim() : "";

  const email = emailRaw || null;
  const phoneWhatsapp = phoneRaw || null;
  const preferredContact = preferredRaw
    ? (validContacts.includes(preferredRaw as ContactType)
        ? (preferredRaw as ContactType)
        : preferredRaw)
    : null;
  const status = statusRaw
    ? (validStatuses.includes(statusRaw as ResponseStatus)
        ? (statusRaw as ResponseStatus)
        : statusRaw)
    : null;

  return {
    playerName,
    email,
    phoneWhatsapp,
    preferredContact,
    status,
  };
}

async function upsertResponse(
  supabase: SupabaseClient,
  sessionId: string,
  values: NormalisedRsvp
) {
  const payload = {
    session_id: sessionId,
    player_name: values.playerName,
    email: values.email,
    phone_whatsapp: values.phoneWhatsapp,
    preferred_contact: values.preferredContact,
    status: values.status,
  };

  const { data, error } = await supabase
    .from("session_responses")
    .insert(payload)
    .select("*")
    .single();

  if (!error) return { response: data as SessionResponse, created: true };

  if (error.code !== "23505") {
    throw error;
  }

  const existing = await findExistingResponse(supabase, sessionId, values);
  if (!existing) {
    throw error;
  }

  const { data: updated, error: updateError } = await supabase
    .from("session_responses")
    .update(payload)
    .eq("id", existing.id)
    .select("*")
    .single();

  if (updateError) {
    throw updateError;
  }

  return { response: updated as SessionResponse, created: false };
}

async function findExistingResponse(
  supabase: SupabaseClient,
  sessionId: string,
  values: NormalisedRsvp
): Promise<SessionResponse | null> {
  if (values.email) {
    const { data, error } = await supabase
      .from("session_responses")
      .select("*")
      .eq("session_id", sessionId)
      .eq("email", values.email)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data) return data as SessionResponse;
  }

  if (values.phoneWhatsapp) {
    const { data, error } = await supabase
      .from("session_responses")
      .select("*")
      .eq("session_id", sessionId)
      .eq("phone_whatsapp", values.phoneWhatsapp)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data) return data as SessionResponse;
  }

  const { data, error } = await supabase
    .from("session_responses")
    .select("*")
    .eq("session_id", sessionId)
    .eq("player_name_search", values.playerName.toLowerCase())
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data ? (data as SessionResponse) : null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await context.params;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session id" }, { status: 400 });
    }

    let json: RsvpRequestBody;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const normalised = normalise(json);
    if (!normalised) {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 });
    }

    const supabase = createSupabase();
    const { response, created } = await upsertResponse(
      supabase,
      sessionId,
      normalised
    );

    return NextResponse.json(response, { status: created ? 201 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
