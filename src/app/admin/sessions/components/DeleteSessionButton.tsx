"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteSession } from "../actions";

interface DeleteSessionButtonProps {
  sessionId: number;
}

export default function DeleteSessionButton({ sessionId }: DeleteSessionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!window.confirm("Delete this session?")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteSession(sessionId);
      if (result.message) {
        window.alert(result.message);
        return;
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      title="Delete session"
      aria-label="Delete session"
      className="rounded border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 transition hover:bg-red-100 disabled:opacity-50"
      disabled={isPending}
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
