import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/premortem/AppSidebar";
import { WorkspaceTopBar } from "@/components/premortem/WorkspaceTopBar";
import { ProtocolEditor } from "@/components/premortem/ProtocolEditor";
import { IntelligencePanel } from "@/components/premortem/IntelligencePanel";
import { FloatingCopilot } from "@/components/premortem/FloatingCopilot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PreMortem Labs · Biomedical Protocol Intelligence" },
      {
        name: "description",
        content:
          "AI-native protocol validation workspace for university biomedical research labs in Nigeria and West Africa.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  return (
    <div className="dark h-screen w-full flex bg-background text-foreground overflow-hidden">
      <AppSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <WorkspaceTopBar />
        <div className="flex-1 min-h-0 flex relative">
          <div className="flex-1 min-w-0 flex flex-col relative">
            <ProtocolEditor />
            <FloatingCopilot />
          </div>
          <IntelligencePanel />
        </div>
      </div>
    </div>
  );
}
