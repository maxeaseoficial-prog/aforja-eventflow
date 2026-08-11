import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "@/components/forja/LoginPage";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }: any) => {
    // If we're already authenticated, redirect to home
    // Note: We check session directly because hooks aren't available in beforeLoad
    // but sessionStorage is consistent with our zustand strategy
    try {
      const sessionStr = sessionStorage.getItem("forja-auth-session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.state?.isAuthenticated) {
          throw redirect({ to: "/" });
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === "Redirect") throw e;
    }
  },
  component: LoginPage,
});
