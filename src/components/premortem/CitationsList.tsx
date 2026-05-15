import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, Quote } from "lucide-react";
import { useState } from "react";
import { useValidation } from "@/lib/validation-store";
import { cn } from "@/lib/utils";

function confidenceTone(c: number) {
  if (c >= 0.9) return { label: "High", cls: "text-severity-low" };
  if (c >= 0.8) return { label: "Strong", cls: "text-primary-glow" };
  return { label: "Moderate", cls: "text-severity-medium" };
}

export function CitationsList() {
  const [open, setOpen] = useState<number | null>(0);
  const { citations } = useValidation();

  if (citations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-2xl bg-surface-2 border border-border p-5 shadow-soft"
      >
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
          Linked Citations
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Run validation to generate citations.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl bg-surface-2 border border-border p-5 shadow-soft"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Linked Citations
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {citations.length} matches
        </span>
      </div>

      <ul className="space-y-2">
        {citations.map((c, i) => {
          const isOpen = open === i;
          const tone = confidenceTone(c.confidence);
          const pct = Math.round(c.confidence * 100);

          return (
            <li
              key={c.doi}
              className={cn(
                "rounded-xl border bg-surface-3/60 transition-colors",
                isOpen ? "border-primary/30" : "border-border hover:border-border-strong",
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-left px-3.5 py-3 flex items-start gap-3"
              >
                <Quote className="size-3.5 text-primary-glow shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold text-foreground leading-snug">
                    {c.title}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground mt-1 font-mono truncate">
                    {c.authors} {c.journal} {c.year}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 w-[58px]">
                  <span className={cn("text-[10px] font-bold font-mono", tone.cls)}>
                    {pct}%
                  </span>
                  <div className="h-1 w-full rounded-full bg-border-strong overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-primary-glow"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    {tone.label}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3 text-muted-foreground transition-transform duration-200 mt-0.5 shrink-0",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 pt-0 space-y-3">
                      <p className="text-[11px] text-muted-foreground leading-relaxed border-l border-primary/30 pl-3">
                        {c.abstract}
                      </p>
                      <div className="rounded-lg bg-surface-2 border border-border p-3">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-primary-glow mb-1">
                          Anchored Evidence
                        </div>
                        <p className="text-[11px] text-foreground/90 leading-relaxed italic">
                          "{c.evidence}"
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          doi:{c.doi}
                        </span>
                        <button className="inline-flex items-center gap-1 text-[10.5px] font-bold text-primary-glow hover:text-primary-foreground hover:bg-primary/20 px-2 py-1 rounded-md transition-colors">
                          Insert citation <ExternalLink className="size-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
