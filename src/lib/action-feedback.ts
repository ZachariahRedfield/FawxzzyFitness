"use client";

import type { ActionResult } from "@/lib/action-result";

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
};

type ToastableActionResult<T> = ActionResult<T> | { ok: boolean; error?: string };

export function toastActionResult<T>(
  toast: ToastApi,
  result: ToastableActionResult<T>,
  messages: { success: string; error: string },
) {
  if (result.ok) {
    toast.success(messages.success);
    return;
  }

  toast.error(result.error ?? messages.error);
}
