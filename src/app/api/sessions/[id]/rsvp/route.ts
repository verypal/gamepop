import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isContactType,
  isResponseStatus,
  type ContactType,
  type ResponseStatus,
  type SessionResponse,
} from "@/lib/types";

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

type NormaliseError =
  | { type: "missing_player_name"; message: string }
  | { type: "invalid_contact"; message: string; value: string }
  | { type: "invalid_status"; message: string; value: string };

type NormaliseResult =
  | { success: true; value: NormalisedRsvp }
  | { success: false; error: NormaliseError };

function normalise(body: RsvpRequestBody): NormaliseResult {
  const playerName = typeof body.playerName === "string" ? body.playerName.trim() : "";
  if (!playerName) {
    return {
      success: false,
      error: { type: "missing_player_name", message: "Player name is required" },
    };
  }

  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const phoneRaw = typeof body.phoneWhatsapp === "string" ? body.phoneWhatsapp.trim() : "";
  const preferredRaw = typeof body.preferredContact === "string" ? body.preferredContact.trim() : "";
  const statusRaw = typeof body.status === "string" ? body.status.trim() : "";

  const email = emailRaw || null;
  const phoneWhatsapp = phoneRaw || null;
  let preferredContact: ContactType | null = null;
  if (preferredRaw) {
    if (isContactType(preferredRaw)) {
      preferredContact = preferredRaw;
    } else {
      return {
        success: false,
        error: {
          type: "invalid_contact",
          message: `Unsupported preferred contact method: ${preferredRaw}`,
          value: preferredRaw,
        },
      };
    }
  }

  let status: ResponseStatus | null = null;
  if (statusRaw) {
    if (isResponseStatus(statusRaw)) {
      status = statusRaw;
    } else {
      return {
        success: false,
        error: {
          type: "invalid_status",
          message: `Unsupported RSVP status: ${statusRaw}`,
          value: statusRaw,
        },
      };
    }
  }

  return {
    success: true,
    value: {
      playerName,
      email,
      phoneWhatsapp,
      preferredContact,
      status,
    },
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
    if (!normalised.success) {
      const { error } = normalised;
      if (
        error.type === "invalid_contact" ||
        error.type === "invalid_status" ||
        error.type === "missing_player_name"
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ error: "Invalid RSVP payload" }, { status: 400 });
    }

    const supabase = createSupabase();
    const { response, created } = await upsertResponse(
      supabase,
      sessionId,
      normalised.value
    );

    return NextResponse.json(response, { status: created ? 201 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
