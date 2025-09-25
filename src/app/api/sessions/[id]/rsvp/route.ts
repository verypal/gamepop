import { NextResponse } from "next/server";

import { getSupabase } from "@/lib/supabaseClient";

const ALLOWED_STATUSES = new Set(["in", "out", "maybe"]);
const ALLOWED_CONTACT = new Set(["email", "phone"]);

type RSVPRequestBody = {
  playerName?: unknown;
  email?: unknown;
  phone?: unknown;
  preferredContact?: unknown;
  status?: unknown;
};

type ResponseStatus = "in" | "out" | "maybe";
type ContactPreference = "email" | "phone" | null;

type SessionResponseRow = {
  id: string;
  session_id: string;
  player_name: string;
  player_name_search: string | null;
  email: string | null;
  phone_whatsapp: string | null;
  preferred_contact: ContactPreference;
  status: ResponseStatus | null;
  updated_at: string | null;
};

function buildContactKey({
  email,
  phone,
  playerName,
}: {
  email: string | null;
  phone: string | null;
  playerName: string;
}) {
  if (email) {
    return email.toLowerCase();
  }
  if (phone) {
    return phone.toLowerCase();
  }
  return playerName.trim().toLowerCase();
}

async function findExistingResponse(
  sessionId: string,
  {
    email,
    phone,
    playerName,
  }: { email: string | null; phone: string | null; playerName: string },
): Promise<SessionResponseRow | null> {
  const supabase = getSupabase();

  if (email) {
    const { data } = await supabase
      .from("session_responses")
      .select("*")
      .eq("session_id", sessionId)
      .ilike("email", email)
      .maybeSingle<SessionResponseRow>();
    if (data) {
      return data;
    }
  }

  if (phone) {
    const { data } = await supabase
      .from("session_responses")
      .select("*")
      .eq("session_id", sessionId)
      .ilike("phone_whatsapp", phone)
      .maybeSingle<SessionResponseRow>();
    if (data) {
      return data;
    }
  }

  const loweredName = playerName.trim().toLowerCase();
  if (!loweredName) {
    return null;
  }

  const { data } = await supabase
    .from("session_responses")
    .select("*")
    .eq("session_id", sessionId)
    .eq("player_name_search", loweredName)
    .maybeSingle<SessionResponseRow>();

  return data ?? null;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const { id: sessionId } = params;
  let body: RSVPRequestBody;

  try {
    body = (await request.json()) as RSVPRequestBody;
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const playerName = typeof body.playerName === "string" ? body.playerName.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const status = typeof body.status === "string" ? body.status.toLowerCase() : "";
  const preferredContactValue =
    typeof body.preferredContact === "string" ? body.preferredContact.toLowerCase() : null;

  if (!playerName) {
    return NextResponse.json({ message: "Name is required." }, { status: 400 });
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ message: "Invalid RSVP status." }, { status: 400 });
  }

  let preferredContact: ContactPreference = null;
  if (preferredContactValue && ALLOWED_CONTACT.has(preferredContactValue)) {
    preferredContact = preferredContactValue as ContactPreference;
  }

  const email = emailRaw ? emailRaw : null;
  const phone = phoneRaw ? phoneRaw : null;

  const supabase = getSupabase();
  const existingResponse = await findExistingResponse(sessionId, {
    email,
    phone,
    playerName,
  });

  const payload = {
    session_id: sessionId,
    player_name: playerName,
    email,
    phone_whatsapp: phone,
    preferred_contact: preferredContact,
    status: status as ResponseStatus,
  } satisfies Partial<SessionResponseRow> & { session_id: string; player_name: string };

  let savedResponse: SessionResponseRow | null = null;

  if (existingResponse) {
    const { data, error } = await supabase
      .from("session_responses")
      .update(payload)
      .eq("id", existingResponse.id)
      .select()
      .maybeSingle<SessionResponseRow>();

    if (error) {
      return NextResponse.json({ message: "Unable to update RSVP." }, { status: 500 });
    }

    savedResponse = data ?? existingResponse;
  } else {
    const { data, error } = await supabase
      .from("session_responses")
      .insert(payload)
      .select()
      .maybeSingle<SessionResponseRow>();

    if (error) {
      return NextResponse.json({ message: "Unable to save RSVP." }, { status: 500 });
    }

    savedResponse = data ?? null;
  }

  const contactKey = buildContactKey({
    email,
    phone,
    playerName,
  });

  const response = NextResponse.json({ success: true, response: savedResponse });
  response.cookies.set({
    name: `session-rsvp-${sessionId}`,
    value: contactKey,
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 180, // ~6 months
    path: "/",
  });

  return response;
}
