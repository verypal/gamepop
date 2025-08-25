"use client";

import { useFormState } from "react-dom";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import { SessionFormSchema, type SessionFormData } from "@/lib/sessionSchema";

interface FormState {
  errors: Record<string, string>;
}

const initialState: FormState = { errors: {} };

async function createSession(_prev: FormState, formData: FormData): Promise<FormState | void> {
  "use server";
  const raw = Object.fromEntries(formData.entries());
  const parsed = SessionFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errors: Record<string, string> = {};
    Object.keys(fieldErrors).forEach((key) => {
      const val = fieldErrors[key as keyof typeof fieldErrors];
      if (val && val.length) errors[key] = val[0];
    });
    return { errors };
  }
  const data = parsed.data as SessionFormData;
  const supabase = getSupabase();
  const start = new Date(`${data.date}T${data.start_time}`);
  const payload: Record<string, unknown> = {
    title: data.title,
    time: start.toISOString(),
    venue: data.venue,
    price: data.price ?? null,
    spots_left: data.spots,
    roster: [],
    notes: data.notes ?? null,
  };
  if (data.end_time) {
    const end = new Date(`${data.date}T${data.end_time}`);
    payload.end_time = end.toISOString();
  }
  const { data: inserted, error } = await supabase
    .from("sessions")
    .insert(payload)
    .select("id")
    .single();
  if (error || !inserted) {
    return { errors: { form: error?.message ?? "Insert failed" } };
  }
  redirect(`/admin/sessions?created=${inserted.id}`);
}

export default function NewSessionPage() {
  const [state, formAction] = useFormState(createSession, initialState);
  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">New Session</h1>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" type="text" className="mt-1 w-full border rounded p-2" />
          {state.errors.title && <p className="text-sm text-red-600">{state.errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input name="date" type="date" className="mt-1 w-full border rounded p-2" />
          {state.errors.date && <p className="text-sm text-red-600">{state.errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Start Time</label>
          <input name="start_time" type="time" className="mt-1 w-full border rounded p-2" />
          {state.errors.start_time && <p className="text-sm text-red-600">{state.errors.start_time}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">End Time</label>
          <input name="end_time" type="time" className="mt-1 w-full border rounded p-2" />
          {state.errors.end_time && <p className="text-sm text-red-600">{state.errors.end_time}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Venue</label>
          <input name="venue" type="text" className="mt-1 w-full border rounded p-2" />
          {state.errors.venue && <p className="text-sm text-red-600">{state.errors.venue}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Spots</label>
          <input
            name="spots"
            type="number"
            min={1}
            className="mt-1 w-full border rounded p-2"
          />
          {state.errors.spots && <p className="text-sm text-red-600">{state.errors.spots}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <input name="price" type="text" className="mt-1 w-full border rounded p-2" />
          {state.errors.price && <p className="text-sm text-red-600">{state.errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            maxLength={500}
            className="mt-1 w-full border rounded p-2"
          />
          {state.errors.notes && <p className="text-sm text-red-600">{state.errors.notes}</p>}
        </div>
        {state.errors.form && <p className="text-sm text-red-600">{state.errors.form}</p>}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Create
        </button>
      </form>
    </main>
  );
}
