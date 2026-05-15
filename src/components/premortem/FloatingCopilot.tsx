import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Minus, Plus, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useValidation } from "@/lib/validation-store";

type Msg = { role: "user" | "ai"; text: string; chips?: string[] };

export function FloatingCopilot() {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { status, flags, verdict, summary } = useValidation();

  // Seed message when validation completes
  useEffect(() => {
    if (status === "complete" && flags.length > 0) {
      const criticalCount = flags.filter((f) => f.severity === "critical").length;
      const highCount = flags.filter((f) => f.severity === "high").length;
      setMsgs([
        {
          role: "ai",
          text: `I reviewed your protocol and found ${flags.length} issues — ${criticalCount} critical, ${highCount} high severity. ${summary} Ask me about any specific flag or how to fix it.`,
          chips: flags.slice(0, 2).map((f) => `Explain: ${f.issue}`),
        },
      ]);
    }
  }, [status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, isThinking]);

  function buildContext() {
    return [
      `Verdict: ${verdict}`,
      `Summary: ${summary}`,
      `Flags: ${flags.map((f) => `[${f.severity.toUpperCase()}] ${f.issue}: ${f.explanation} Fix: ${f.correction}`).join(" | ")}`,
    ].join("\n");
  }

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: message }]);
    setIsThinking(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context: buildContext() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Backend error: ${res.status}`);
      }

      const data = await res.json();
      setMsgs((m) => [...m, { role: "ai", text: data.reply ?? "Could not get a response." }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not reach the backend.";
      setMsgs((m) => [...m, { role: "ai", text: message }]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="absolute bottom-6 right-6 z-30 pointer-events-none">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="open"
            initial={{ y: 16, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="pointer-events-auto w-[420px] max-h-[540px] rounded-2xl glass shadow-float flex flex-col overflow-hidden"
          >
            <div className="h-11 shrink-0 flex items-center px-4 gap-2 border-b border-border">
              <span className="size-6 rounded-lg bg-gradient-sage grid place-items-center shadow-glow-sage">
                <Sparkles className="size-3 text-primary-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold leading-none">Copilot</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                  <span className="size-1 rounded-full bg-primary-glow pulse-dot" />
                  {isThinking ? "thinking…" : status === "complete" ? "ready" : "waiting for validation"}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="size-6 rounded-md grid place-items-center hover:bg-foreground/10 text-muted-foreground transition-colors"
              >
                <Minus className="size-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {msgs.length === 0 && (
                <div className="text-center text-muted-foreground text-[12px] mt-8">
                  {status === "complete"
                    ? "Ask me anything about your protocol."
                    : "Run validation first to activate Copilot."}
                </div>
              )}
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed",
                      m.role === "user"
                        ? "bg-primary/15 border border-primary/25 text-foreground rounded-br-md"
                        : "bg-surface-3 border border-border text-foreground/95 rounded-bl-md",
                    )}
                  >
                    {m.text}
                    {m.chips && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {m.chips.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => send(chip)}
                            className="text-[10.5px] font-bold px-2 py-1 rounded-md bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary-glow transition-colors"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-surface-3 border border-border rounded-2xl rounded-bl-md px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                      <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                      <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="shrink-0 p-3 border-t border-border bg-surface-2/40">
              <div className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isThinking && send()}
                  placeholder={status === "complete" ? "Ask Copilot to validate, fix, or cite…" : "Run validation first…"}
                  disabled={status !== "complete" || isThinking}
                  className="w-full h-9 pl-3.5 pr-20 rounded-lg bg-surface-3 border border-border text-[12px] focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50"
                />
                <kbd className="absolute right-11 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 font-mono text-[9px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                  <CornerDownLeft className="size-2.5" />
                </kbd>
                <button
                  onClick={() => send()}
                  disabled={status !== "complete" || isThinking}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 rounded-md bg-gradient-sage grid place-items-center hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <Send className="size-3 text-primary-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="pointer-events-auto h-11 px-4 rounded-full glass shadow-float inline-flex items-center gap-2 hover:brightness-110 transition-all"
          >
            <span className="size-5 rounded-md bg-gradient-sage grid place-items-center">
              <Sparkles className="size-2.5 text-primary-foreground" />
            </span>
            <span className="text-[12px] font-bold">Copilot</span>
            <Plus className="size-3 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
