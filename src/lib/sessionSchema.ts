import { z } from "zod";

export function validateTimeOrder(date: string, start: string, end?: string): boolean {
  if (!end) return true;
  return new Date(`${date}T${end}`) > new Date(`${date}T${start}`);
}

interface SessionForm {
  title: string;
  date: string;
  start_time: string;
  end_time?: string;
  venue: string;
  spots: number;
  price?: string;
  notes?: string;
}

export const SessionFormSchema = z
  .object<SessionForm>({
    title: z.string().min(3),
    date: z.string(),
    start_time: z.string(),
    end_time: z.string().optional(),
    venue: z.string().min(2),
    spots: z.coerce.number().int().min(1),
    price: z.string().max(20).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => validateTimeOrder(data.date, data.start_time, data.end_time),
    { path: "end_time", message: "End time must be after start" }
  );

export type SessionFormData = SessionForm;
