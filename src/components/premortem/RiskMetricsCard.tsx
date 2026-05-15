import { motion } from "framer-motion";
import { useValidation } from "@/lib/validation-store";

export function RiskMetricsCard() {
  const { riskScore, subs, status } = useValidation();
  const score = riskScore;

  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = c * (score / 100);

  const severity =
    score === 0 && status === "running"
      ? { label: "Analyzing…", cls: "bg-muted/20 text-muted-foreground border-border" }
      : score >= 75
        ? { label: "High", cls: "bg-severity-high/10 text-severity-high border-severity-high/30" }
        : score >= 40
          ? {
              label: "Medium",
              cls: "bg-severity-medium/10 text-severity-medium border-severity-medium/30",
            }
          : { label: "Low", cls: "bg-severity-low/10 text-severity-low border-severity-low/30" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-gradient-surface border border-border p-5 shadow-soft"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Protocol Risk
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${severity.cls}`}
          >
            <span className="size-1.5 rounded-full bg-current" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {severity.label}
            </span>
          </div>
        </div>

        <div className="relative size-[96px]">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={r}
              strokeWidth="6"
              fill="none"
              className="stroke-border-strong"
            />
            <circle
              cx="50"
              cy="50"
              r={r}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              className="stroke-severity-medium transition-[stroke-dasharray] duration-200 ease-out"
              strokeDasharray={`${dash} ${c}`}
              style={{ filter: "drop-shadow(0 0 6px oklch(0.78 0.14 75 / 0.4))" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-[22px] font-bold leading-none font-mono tabular-nums">
                {score}
              </div>
              <div className="text-[9px] font-bold tracking-wider text-muted-foreground mt-0.5">
                /100
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-border">
        {subs.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">{s.label}</span>
              <span className="text-[11px] font-bold font-mono text-foreground tabular-nums">
                {s.value}
              </span>
            </div>
            <div className="h-1 rounded-full bg-border-strong overflow-hidden">
              <div
                className="h-full bg-gradient-sage transition-[width] duration-700 ease-out"
                style={{ width: `${s.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
