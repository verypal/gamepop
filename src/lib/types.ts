export type ContactType = "email" | "phone_whatsapp" | (string & {});

export type ResponseStatus = "in" | "out" | "maybe" | (string & {});

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
