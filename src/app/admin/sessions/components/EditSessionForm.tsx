"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { FormState } from "../new/actions";
import { updateSession } from "../actions";
import SessionForm, { type SessionFormValues } from "./SessionForm";

interface EditSessionFormProps {
  sessionId: number;
  initialValues: SessionFormValues;
}

export default function EditSessionForm({
  sessionId,
  initialValues,
}: EditSessionFormProps) {
  const router = useRouter();

  const handleSuccess = useCallback(
    (state: FormState) => {
      if (!state.message && state.id) {
        router.replace(`/admin/sessions?new=${state.id}`);
        router.refresh();
      }
    },
    [router]
  );

  return (
    <SessionForm
      initial={initialValues}
      action={updateSession}
      submitLabel="Save Changes"
      sessionId={sessionId}
      onSuccess={handleSuccess}
    />
  );
}
