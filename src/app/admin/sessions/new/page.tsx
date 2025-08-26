"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import sessionForm, { SessionFormData } from "./sessionForm";

export default function NewSessionPage() {
  const router = useRouter();
  const [form, setForm] = useState<SessionFormData>({
    title: "",
    time: "",
    venue: "",
    price: "",
    spots: "",
  });

  useEffect(() => {
    const data = sessionForm.load();
    setForm((prev) => ({ ...prev, ...data }));
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleNext(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sessionForm.save(form);
    router.push("/admin/sessions/new/participants");
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">New Session</h1>
      <form onSubmit={handleNext} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            required
            value={form.title || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            name="time"
            required
            value={form.time || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Venue</label>
          <input
            name="venue"
            required
            value={form.venue || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            name="price"
            type="text"
            required
            value={form.price || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Spots</label>
          <input
            name="spots"
            type="number"
            required
            value={form.spots || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Next
        </button>
      </form>
    </main>
  );
}
