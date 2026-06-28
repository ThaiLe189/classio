"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Field, Input, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import type { CalSession } from "@/components/WeekScheduleView";
import { createClass } from "./actions";

export default function CreateClassForm({ existing }: { existing: CalSession[] }) {
  const [state, formAction] = useActionState(createClass, null);
  const [resetKey, setResetKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // After a successful create, clear the form + calendar selection so the next
  // class starts fresh (otherwise the previous selection carries over).
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setResetKey((k) => k + 1);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <Field label="Class name">
        <Input name="name" required placeholder="e.g. Math 9A" />
      </Field>
      <Field label="Description (optional)">
        <Textarea name="description" rows={2} />
      </Field>
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-900">Weekly schedule</span>
        <p className="mb-2 text-xs text-gray-500">
          Drag across the calendar to pick class times. Drag over a selection again to remove it.
        </p>
        <ScheduleCalendar key={resetKey} existing={existing} />
      </div>
      <SubmitButton>Add class</SubmitButton>
    </form>
  );
}
