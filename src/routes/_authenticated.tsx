import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
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
  component: () => <Outlet />,
});
