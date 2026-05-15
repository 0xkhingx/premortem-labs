import { motion } from "framer-motion";
import { RiskMetricsCard } from "./RiskMetricsCard";
import { PreflightChecks } from "./PreflightChecks";
import { ReasoningTimeline } from "./ReasoningTimeline";

export function IntelligencePanel() {
  return (
    <motion.aside
      initial={{ x: 16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="w-[380px] shrink-0 hidden xl:flex flex-col min-h-0"
    >
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pl-2 space-y-3">
        <RiskMetricsCard />
        <PreflightChecks />
        <ReasoningTimeline />
        <div className="h-4" />
      </div>
    </motion.aside>
  );
}
