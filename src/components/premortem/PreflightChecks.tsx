import { motion } from "framer-motion";
import { Check, AlertTriangle, X, Loader2 } from "lucide-react";
import { useValidation } from "@/lib/validation-store";
import { cn } from "@/lib/utils";

const stateConfig = {
  pass: {
    Icon: Check,
    color: "text-severity-low",
    bg: "bg-severity-low/10",
    border: "border-severity-low/25",
  },
  warn: {
    Icon: AlertTriangle,
    color: "text-severity-medium",
    bg: "bg-severity-medium/10",
    border: "border-severity-medium/25",
  },
  fail: {
    Icon: X,
    color: "text-severity-high",
    bg: "bg-severity-high/10",
    border: "border-severity-high/25",
  },
  pending: {
    Icon: Loader2,
    color: "text-muted-foreground",
    bg: "bg-surface-3",
    border: "border-border-strong",
  },
} as const;

export function PreflightChecks() {
  const { preflight, passCount, totalCount } = useValidation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="rounded-2xl bg-surface-2 border border-border p-5 shadow-soft"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Pre-flight Checks
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {passCount} / {totalCount} pass
        </span>
      </div>

      <ul className="space-y-1.5">
        {preflight.map((c, i) => {
          const cfg = stateConfig[c.state];
          const Icon = cfg.Icon;
          const isPending = c.state === "pending";
          return (
            <li
              key={c.label + i}
              className="group flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-foreground/[0.03] transition-colors"
            >
              <span
                className={cn(
                  "size-5 shrink-0 mt-0.5 rounded-md grid place-items-center border transition-colors",
                  cfg.bg,
                  cfg.border,
                )}
              >
                <Icon
                  className={cn("size-3", cfg.color, isPending && "animate-spin")}
                  strokeWidth={isPending ? 2.5 : 3}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "text-[12px] font-bold leading-tight transition-colors",
                    isPending ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {c.label}
                </div>
                <div className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">
                  {isPending ? "Evaluating…" : c.note}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
