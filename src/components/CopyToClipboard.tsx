"use client";
import { useState } from "react";

export default function CopyToClipboard({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={className}>
      <textarea value={text} readOnly className="sr-only" />
      <button onClick={onCopy} className="text-sm text-blue-600 underline">
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
