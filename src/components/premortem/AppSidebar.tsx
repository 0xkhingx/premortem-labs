import { motion } from "framer-motion";
import {
  FlaskConical,
  ListChecks,
  ShieldAlert,
  BookOpen,
  Ruler,
  Settings,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Protocols", icon: FlaskConical },
  { to: "/queue", label: "Validation Queue", icon: ListChecks, badge: 3 },
  { to: "/risk-library", label: "Risk Library", icon: ShieldAlert },
  { to: "/literature", label: "Literature", icon: BookOpen },
  { to: "/standards", label: "Lab Standards", icon: Ruler },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <motion.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      className="w-16 shrink-0 bg-surface-1 border-r border-border flex flex-col items-center py-4 gap-1"
    >
      <Link
        to="/"
        className="size-9 rounded-xl bg-gradient-sage shadow-glow-sage grid place-items-center mb-3"
      >
        <span className="font-mono text-[11px] font-bold text-primary-foreground">PM</span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={cn(
                "group relative size-10 rounded-xl grid place-items-center transition-all duration-200 hover:bg-accent/60",
                active && "bg-accent text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-pill"
                  className="absolute -left-[10px] top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r bg-primary-glow"
                />
              )}
              <Icon
                className={cn(
                  "size-[18px] transition-transform duration-200 group-hover:scale-110",
                  active
                    ? "text-primary-glow"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {"badge" in item && item.badge && (
                <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold grid place-items-center font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/settings"
        title="Settings"
        className={cn(
          "size-10 rounded-xl grid place-items-center transition-colors",
          isActive("/settings")
            ? "bg-accent text-primary-glow"
            : "hover:bg-accent/60 text-muted-foreground hover:text-foreground",
        )}
      >
        <Settings className="size-[18px]" />
      </Link>

      <div
        title="Adaola Okonkwo · PI"
        className="size-9 rounded-full bg-surface-2 border border-border-strong grid place-items-center mt-1 cursor-pointer hover:border-primary/40 transition-colors"
      >
        <span className="font-mono text-[10px] font-bold text-foreground">AO</span>
      </div>
    </motion.aside>
  );
}
