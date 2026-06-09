import { Check, KeyRound, Vote, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { key: "code", label: "Verify", icon: KeyRound },
  { key: "ballot", label: "Vote", icon: Vote },
  { key: "results", label: "Results", icon: BarChart3 },
];

export const VoteStepper = ({ current }: { current: "code" | "ballot" | "results" }) => {
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center justify-center gap-1 sm:gap-4 mb-6 sm:mb-8" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        const Icon = s.icon;
        return (
          <li key={s.key} className="flex items-center gap-1 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border-2 transition-all",
                  active && "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]",
                  done && "border-success bg-success text-success-foreground",
                  !active && !done && "border-border bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={cn("text-[11px] sm:text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 w-6 sm:w-16 rounded-full -mt-5", done ? "bg-success" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
};
