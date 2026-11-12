import { cloneElement, forwardRef } from "react";
import { cn } from "./_cn";

const variants = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border bg-background hover:bg-muted",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  ghost: "hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground",
};
const sizes = { default: "h-10 px-4 py-2", sm: "h-9 px-3", lg: "h-11 px-8", icon: "h-9 w-9" };

export const Button = forwardRef(function Button({ className, variant = "default", size = "default", asChild, disabled, children, ...props }, ref) {
  const cls = cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], disabled && "pointer-events-none opacity-50", className);
  if (asChild) return cloneElement(children, { className: cn(cls, children.props.className) });
  return <button ref={ref} className={cls} disabled={disabled} {...props}>{children}</button>;
});
export default Button;
