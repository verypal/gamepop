"use client";
import { useState } from "react";

export default function CheckoutButton({ sessionId }: { sessionId: string }) {
  const [loading, setLoading] = useState(false);
  const onPay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Something went wrong");
    } finally { setLoading(false); }
  };
  return (
    <button onClick={onPay} disabled={loading}
      className="w-full rounded-xl bg-black text-white py-3 disabled:opacity-60">
      {loading ? "Redirecting..." : "Pay & Confirm"}
    </button>
  );
}
