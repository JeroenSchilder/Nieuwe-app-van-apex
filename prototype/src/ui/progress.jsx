import { cn } from "./_cn";
export const Progress = ({ value = 0, className }) => (
  <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
    <div className="h-full bg-primary transition-all" style={{ width: `${value}%` }} />
  </div>
);
export default Progress;
