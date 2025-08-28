"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionStepTwoForm {
  minPlayers: string;
  maxPlayers: string;
  autoMarked: boolean;
  paymentsEnabled: boolean;
  price: string;
  currency: string;
}

export default function SessionStepTwoPage() {
  const router = useRouter();
  const [form, setForm] = useState<SessionStepTwoForm>({
    minPlayers: "",
    maxPlayers: "",
    autoMarked: false,
    paymentsEnabled: false,
    price: "",
    currency: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("sessionForm");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setForm((prev) => ({
          ...prev,
          minPlayers: data.minPlayers?.toString() ?? "",
          maxPlayers: data.maxPlayers?.toString() ?? "",
          autoMarked: data.autoMarked ?? false,
          paymentsEnabled: data.paymentsEnabled ?? false,
          price: data.price?.toString() ?? "",
          currency: data.currency ?? "",
        }));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const val = type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  }

  function handleNext() {
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("sessionForm") || "{}");
      const merged = {
        ...existing,
        minPlayers: Number(form.minPlayers) || null,
        maxPlayers: Number(form.maxPlayers) || null,
        autoMarked: form.autoMarked,
        paymentsEnabled: form.paymentsEnabled,
        price: form.price ? Number(form.price) : null,
        currency: form.currency,
      };
      localStorage.setItem("sessionForm", JSON.stringify(merged));
    }
    router.push("/admin/sessions/new/3");
  }

  function handleBack() {
    router.push("/admin/sessions/new/1");
  }

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">New Session</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="minPlayers">
            Minimum Players
          </label>
          <input
            id="minPlayers"
            name="minPlayers"
            type="number"
            value={form.minPlayers}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="maxPlayers">
            Maximum Players
          </label>
          <input
            id="maxPlayers"
            name="maxPlayers"
            type="number"
            value={form.maxPlayers}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="autoMarked"
            name="autoMarked"
            type="checkbox"
            checked={form.autoMarked}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="autoMarked" className="text-sm font-medium">
            Auto marked
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="paymentsEnabled"
            name="paymentsEnabled"
            type="checkbox"
            checked={form.paymentsEnabled}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="paymentsEnabled" className="text-sm font-medium">
            Enable payments
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="price">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="currency">
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Next
        </button>
      </div>
    </main>
  );
}

