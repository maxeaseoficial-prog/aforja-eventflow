import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/forja/AppShell";

export const Route = createFileRoute("/_shell")({
  component: AppShell,
});
