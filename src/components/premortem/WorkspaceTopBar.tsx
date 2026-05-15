import { motion } from "framer-motion";
import { Search, Sparkles, GitBranch, Clock, Loader2, Check } from "lucide-react";
import { runValidation, useValidation } from "@/lib/validation-store";
import { cn } from "@/lib/utils";
import { useProtocol } from "@/lib/protocol-store";

export function WorkspaceTopBar() {
  const protocolText = useProtocol();
  const { status } = useValidation();
  const isRunning = status === "running";
  const title = protocolText.split(/\r?\n/, 1)[0]?.trim().slice(0, 60) || "New Protocol";

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="h-14 shrink-0 border-b border-border bg-surface-1/60 backdrop-blur-sm flex items-center px-5 gap-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-[11px] font-bold tracking-wider px-2 py-1 rounded-md bg-surface-2 border border-border text-muted-foreground">
          PRT-2025-0142
        </span>
        <h1 className="text-[14px] font-bold text-foreground truncate">
          {title}
        </h1>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-300/20">
          <span className="size-1.5 rounded-full bg-amber-300" />
          Draft · v0.4
        </span>
        <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <GitBranch className="size-3" /> main
        </span>
        <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Clock className="size-3" /> edited 4 min ago
        </span>
      </div>

      <div className="flex-1" />

      <div className="relative w-72 max-w-[40vw]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          placeholder="Search protocols, citations, reagents..."
          className="w-full h-9 pl-9 pr-12 rounded-lg bg-surface-2 border border-border text-[12px] font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring transition-colors"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <button
        onClick={() => {
          if (!isRunning) runValidation(protocolText);
        }}
        disabled={isRunning}
        className={cn(
          "group h-9 px-4 rounded-lg font-bold text-[12px] inline-flex items-center gap-2 transition-all duration-200",
          isRunning
            ? "bg-surface-2 border border-border text-muted-foreground cursor-not-allowed"
            : "bg-gradient-sage text-primary-foreground shadow-glow-sage hover:brightness-110",
        )}
      >
        {isRunning ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Validating...
          </>
        ) : status === "complete" ? (
          <>
            <Check className="size-3.5" strokeWidth={3} />
            Re-validate
          </>
        ) : (
          <>
            <Sparkles className="size-3.5 transition-transform group-hover:rotate-12" />
            Validate
          </>
        )}
      </button>
    </motion.header>
  );
}
