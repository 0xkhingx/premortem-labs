import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/literature")({
  component: () => (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Literature</h2>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  ),
});
