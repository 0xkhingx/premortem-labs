import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useValidation } from "@/lib/validation-store";
import { cn } from "@/lib/utils";

export function ReasoningTimeline() {
  const { reasoning, status } = useValidation();
  const isLive = status === "running";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl bg-surface-2 border border-border p-5 shadow-soft"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          AI Reasoning
        </h3>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-mono",
            isLive ? "text-primary-glow" : "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isLive ? "bg-primary-glow pulse-dot" : "bg-muted-foreground/50",
            )}
          />
          {isLive ? "live" : "idle"}
        </span>
      </div>

      <ol className="relative space-y-3">
        <span className="absolute left-[7px] top-2 bottom-2 w-px bg-border-strong" />
        {reasoning.map((step, i) => {
          const isDone = step.status === "done";
          const isActive = step.status === "active";
          return (
            <li key={step.label + i} className="relative flex items-start gap-3 pl-0">
              <span
                className={cn(
                  "relative z-10 size-[15px] rounded-full grid place-items-center shrink-0 mt-0.5 transition-colors",
                  isDone && "bg-primary/20 border border-primary/40",
                  isActive && "bg-primary border border-primary-glow pulse-dot",
                  !isDone && !isActive && "bg-surface-3 border border-border-strong",
                )}
              >
                {isDone && <Check className="size-2.5 text-primary-glow" strokeWidth={3.5} />}
                {isActive && (
                  <Loader2 className="size-2.5 text-primary-foreground animate-spin" />
                )}
              </span>

              <div className="min-w-0 flex-1 pb-0.5">
                <div
                  className={cn(
                    "text-[12px] leading-snug transition-colors",
                    isDone && "text-muted-foreground font-medium",
                    isActive && "text-foreground font-bold",
                    !isDone && !isActive && "text-muted-foreground/60 font-medium",
                  )}
                >
                  {step.label}
                  {isActive && <span className="ml-1 inline-block">…</span>}
                </div>
                {isActive && (
                  <div className="mt-1 h-0.5 w-full rounded-full overflow-hidden bg-border">
                    <div className="h-full w-full shimmer bg-primary/30" />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}
