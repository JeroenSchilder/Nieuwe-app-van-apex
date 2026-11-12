import { cn } from "./_cn";
export const Label = ({ className, ...p }) => <label className={cn("text-sm font-medium leading-none", className)} {...p} />;
export default Label;
