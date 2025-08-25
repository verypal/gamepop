"use client";
import { useState } from "react";

export default function CopyToClipboard({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        await navigator.clipboard.writeText(ta.value);
        document.body.removeChild(ta);
        setStatus("copied");
      } catch {
        setStatus("error");
      }
    } finally {
      setTimeout(() => setStatus("idle"), 1500);
    }
  }

  return (
    <button
      onClick={onCopy}
      type="button"
      aria-label="Copy share text"
      className={[
        // compact “secondary” button
        "inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-sm",
        "border-gray-300 hover:bg-gray-50 active:scale-[.99] transition",
        className,
      ].join(" ")}
    >
      <span className="i-lucide-copy w-4 h-4" aria-hidden />{/* optional icon if you have lucide */}
      {status === "copied"
        ? "Copied ✓"
        : status === "error"
        ? "Copy failed"
        : label}
    </button>
  );
}
