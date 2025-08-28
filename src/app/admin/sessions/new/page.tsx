"use client";

import {
  useState,
  useEffect,
  ChangeEvent,
  FocusEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";

interface FormState {
  title: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Errors {
  title?: string;
  venue?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}

const storageKey = "sessionForm";

export default function NewSessionPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    title: "",
    venue: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.location && !data.venue) {
          data.venue = data.location;
          delete data.location;
        }
        setForm(data);
      } catch {
        /* ignore */
      }
    }
  }, []);

  function validateField(name: string, value: string): string | undefined {
    switch (name) {
      case "title":
      case "venue":
      case "date":
      case "startTime":
        if (!value) return "Required";
        break;
      case "endTime":
        if (value && form.startTime && value <= form.startTime) {
          return "End time must be later than start time";
        }
        break;
    }
    return undefined;
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleBack() {
    localStorage.setItem(storageKey, JSON.stringify(form));
    router.back();
  }

  function handleNext(e: FormEvent) {
    e.preventDefault();
    const newErrors: Errors = {};
    (Object.keys(form) as Array<keyof FormState>).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      localStorage.setItem(storageKey, JSON.stringify(form));
      router.push("/admin/sessions/new/schedule");
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">New Session</h1>
      <form onSubmit={handleNext} className="space-y-4" noValidate>
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border rounded p-2 ${errors.title ? "border-red-500" : ""}`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>
        <div>
          <label htmlFor="venue" className="block text-sm font-medium mb-1">
            Venue
          </label>
          <input
            id="venue"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border rounded p-2 ${errors.venue ? "border-red-500" : ""}`}
          />
          {errors.venue && (
            <p className="text-red-500 text-sm mt-1">{errors.venue}</p>
          )}
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border rounded p-2 ${errors.date ? "border-red-500" : ""}`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium mb-1">
            Start
          </label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border rounded p-2 ${errors.startTime ? "border-red-500" : ""}`}
          />
          {errors.startTime && (
            <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium mb-1">
            End (optional)
          </label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border rounded p-2 ${errors.endTime ? "border-red-500" : ""}`}
          />
          {errors.endTime && (
            <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        </div>
      </form>
    </main>
  );
}

