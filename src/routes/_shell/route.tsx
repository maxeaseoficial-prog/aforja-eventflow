import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/forja/AppShell";

export const Route = createFileRoute("/_shell")({
  beforeLoad: ({ location }) => {
    try {
      if (typeof window !== "undefined") {
        const sessionStr = sessionStorage.getItem("forja-auth-session");
        let authenticated = false;
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            authenticated = !!session?.state?.isAuthenticated;
          } catch (e) {
            sessionStorage.removeItem("forja-auth-session");
          }
        }

        if (!authenticated) {
          throw redirect({
            to: "/login",
            search: {
              redirect: location.href,
            },
          });
        }
      }
    } catch (e: any) {
      if (e.name === "Redirect") throw e;
      throw redirect({ to: "/login" });
    }
  },
  component: AppShell,
});
