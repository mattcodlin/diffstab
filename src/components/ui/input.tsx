import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-sm border border-line bg-inset px-3 font-mono text-sm tabular-nums text-fg",
        "placeholder:text-subtle",
        "transition-colors duration-150",
        "focus:border-copper/60 focus:outline-none focus:ring-2 focus:ring-copper/30",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
