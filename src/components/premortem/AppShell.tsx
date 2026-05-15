import { motion } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="dark h-screen w-full flex bg-background text-foreground overflow-hidden">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <motion.header
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="h-14 shrink-0 border-b border-border bg-surface-1/60 backdrop-blur-sm flex items-center px-6 gap-4"
        >
          <div className="flex items-baseline gap-3 min-w-0">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </span>
            <h1 className="text-[14px] font-bold text-foreground truncate">{title}</h1>
          </div>
          <div className="flex-1" />
          <div className="relative w-72 max-w-[40vw]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              placeholder="Search…"
              className="w-full h-9 pl-9 pr-12 rounded-lg bg-surface-2 border border-border text-[12px] font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
              ⌘K
            </kbd>
          </div>
          {actions}
        </motion.header>

        <main className="flex-1 min-h-0 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-[1280px] mx-auto px-8 py-8"
          >
            <div className="mb-7">
              <h2 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">
                {title}
              </h2>
              {description && (
                <p className="text-[13px] text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
