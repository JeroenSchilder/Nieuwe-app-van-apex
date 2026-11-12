import { forwardRef } from "react";
import { cn } from "./_cn";
export const Textarea = forwardRef(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn("flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50", className)} {...p} />
));
export default Textarea;
