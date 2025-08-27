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
      const ta = document.createElement("textarea");
      try {
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        setStatus("copied");
      } catch {
        setStatus("error");
      } finally {
        document.body.removeChild(ta);
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
