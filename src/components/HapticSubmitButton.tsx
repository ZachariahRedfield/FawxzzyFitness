"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { triggerPressHaptic } from "@/lib/haptics";

export function HapticSubmitButton({ children, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      type="submit"
      onClick={(event) => {
        triggerPressHaptic();
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
}
