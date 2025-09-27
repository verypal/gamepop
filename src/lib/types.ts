export const CONTACT_TYPES = ["email", "phone_whatsapp"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const RESPONSE_STATUSES = ["in", "out", "maybe"] as const;
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];

export function isContactType(value: string): value is ContactType {
  return (CONTACT_TYPES as readonly string[]).includes(value);
}

export function isResponseStatus(value: string): value is ResponseStatus {
  return (RESPONSE_STATUSES as readonly string[]).includes(value);
}

export type SessionResponse = {
  id: string;
  session_id: string;
  player_name: string;
  player_name_search: string;
  email: string | null;
  phone_whatsapp: string | null;
  preferred_contact: ContactType | null;
  status: ResponseStatus | null;
  updated_at: string;
};
