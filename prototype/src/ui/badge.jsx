import { cn } from "./_cn";
const v = { default: "bg-primary text-primary-foreground", secondary: "bg-secondary text-secondary-foreground", outline: "border text-foreground" };
export const Badge = ({ className, variant = "default", ...p }) => (
  <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", v[variant], className)} {...p} />
);
export default Badge;
