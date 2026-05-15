import { motion } from "framer-motion";
import { useProtocol, setProtocol } from "@/lib/protocol-store";
import { useValidation } from "@/lib/validation-store";

export function ProtocolEditor() {
  const protocol = useProtocol();
  const { flags } = useValidation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex-1 min-h-0 m-4 mr-2 rounded-2xl bg-surface-3 border border-border shadow-soft overflow-hidden flex flex-col"
    >
      <div className="h-9 shrink-0 flex items-center px-4 gap-2 border-b border-border bg-surface-2/60">
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-foreground/15" />
          <span className="size-2 rounded-full bg-foreground/15" />
          <span className="size-2 rounded-full bg-foreground/15" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground ml-2">
          protocol.md · UTF-8
        </span>
        <div className="flex-1" />
        <span className="font-mono text-[10px] text-muted-foreground">
          {flags.length > 0 ? `${flags.length} issues detected` : "Paste or type your protocol"}
        </span>
      </div>

      <div className="flex-1 min-h-0 relative">
        <textarea
          value={protocol}
          onChange={(e) => setProtocol(e.target.value)}
          spellCheck={false}
          placeholder="Paste your research protocol here…"
          className="absolute inset-0 w-full h-full resize-none bg-transparent p-5 font-mono text-[12.5px] leading-[1.85] text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none"
        />
      </div>

      {flags.length > 0 && (
        <div className="shrink-0 border-t border-border bg-surface-2/40 p-3 space-y-2 max-h-48 overflow-y-auto">
          {flags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px]">
              <span className={`shrink-0 px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                flag.severity === "critical" ? "bg-severity-critical/20 text-severity-critical" :
                flag.severity === "high" ? "bg-severity-high/20 text-severity-high" :
                flag.severity === "medium" ? "bg-severity-medium/20 text-severity-medium" :
                "bg-severity-low/20 text-severity-low"
              }`}>
                {flag.severity}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground">{flag.issue}</span>
                <span className="text-muted-foreground ml-1">— {flag.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}