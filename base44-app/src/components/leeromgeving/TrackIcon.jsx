import { BookOpen, Flame, Library, Rocket, Target, Trophy } from "lucide-react";

const ICONS = { BookOpen, Flame, Library, Rocket, Target, Trophy };

export default function TrackIcon({ name, className = "h-5 w-5" }) {
  const Icon = ICONS[name] || BookOpen;
  return <Icon className={className} />;
}
