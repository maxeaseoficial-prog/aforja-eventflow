import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/forja/AppShell";

export const Route = createFileRoute("/_shell")({
  beforeLoad: ({ location }) => {
    try {
      const sessionStr = sessionStorage.getItem("forja-auth-session");
      let authenticated = false;
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        authenticated = !!session?.state?.isAuthenticated;
      }

      if (!authenticated) {
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        });
      }
    } catch (e: any) {
      if (e.name === "Redirect") throw e;
      throw redirect({ to: "/login" });
    }
  },
  component: AppShell,
});
