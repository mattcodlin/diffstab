import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "line";

export function Button({
  className,
  variant = "ghost",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-sm px-3.5 text-sm font-medium tracking-tight",
        "transition-colors duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:pointer-events-none disabled:opacity-40",
        variant === "primary" && "bg-copper text-bg hover:bg-copper/90",
        variant === "ghost" && "bg-raised text-fg hover:bg-raised/80 border border-line",
        variant === "line" && "border border-line-strong bg-transparent text-fg hover:bg-raised",
        className,
      )}
      {...props}
    />
  );
}
