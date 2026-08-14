import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ForjaProvider } from "@/components/forja/store";
import { Toaster } from "@/components/ui/sonner";
import { usePWAStore } from "@/hooks/use-pwa";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-black text-primary italic uppercase">404</h1>
        <h2 className="mt-4 text-xl font-bold text-foreground uppercase italic">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 uppercase italic"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full surface-card p-8 border border-border shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-6">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
        </div>
        <h1 className="text-2xl font-display font-black tracking-tight text-foreground uppercase italic text-center">
          Erro Operacional
        </h1>
        <p className="mt-4 text-sm text-muted-foreground text-center leading-relaxed">
          Ocorreu um erro ao carregar os dados do centro de comando. 
          Isso pode ser causado por uma falha na conexão ou dados corrompidos.
        </p>
        
        {error.message && (
          <div className="mt-4 p-3 bg-destructive/5 border border-destructive/10 rounded-md">
            <p className="text-[10px] font-mono text-destructive/70 break-all uppercase tracking-tighter">
              LOG: {error.message}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="w-full h-12 text-sm font-bold uppercase italic tracking-widest"
          >
            Tentar Restaurar
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full h-12 text-sm font-bold uppercase italic tracking-widest"
          >
            <a href="/">Voltar ao Início</a>
          </Button>
          
          <button 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/';
            }}
            className="mt-4 text-[10px] text-muted-foreground hover:text-destructive uppercase tracking-[0.2em] transition-colors"
          >
            Limpar Cache e Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: ({ location }) => {
    // Protected routes check
    if (location.pathname !== "/login") {
      try {
        if (typeof window !== "undefined") {
          const sessionStr = sessionStorage.getItem("forja-auth-session");
          let authenticated = false;
          if (sessionStr) {
            try {
              const session = JSON.parse(sessionStr);
              authenticated = !!session?.state?.isAuthenticated;
            } catch (parseError) {
              console.error("Erro ao processar sessão:", parseError);
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
      }
    }
  },

  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" },
      { title: "FORJA — Event Command Center" },
      {
        name: "description",
        content:
          "Centro de comando do evento A Forja: tarefas, equipe, compras, programação e execução ao vivo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#E6BC63" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { setDeferredPrompt, setNeedsUpdate, checkIsInstalled } = usePWAStore();

  useEffect(() => {
    checkIsInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      checkIsInstalled();
      toast.success("A Forja instalada com sucesso!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Register Service Worker and handle updates
    // Use build-time environment variable to register SW only in production builds
    const isProduction = import.meta.env.PROD;

    if (isProduction && "serviceWorker" in navigator) {
      import("virtual:pwa-register").then(({ registerSW }) => {
        registerSW({
          immediate: true,
          onRegisteredSW(swScriptUrl, registration) {
            console.log("PWA_SW_REGISTERED", {
              swScriptUrl,
              scope: registration?.scope,
              active: Boolean(registration?.active),
              installing: Boolean(registration?.installing),
              waiting: Boolean(registration?.waiting),
            });
            
            // Wait for service worker to be ready
            navigator.serviceWorker.ready.then((readyReg) => {
              console.log("PWA_SW_READY", {
                scope: readyReg.scope,
                active: Boolean(readyReg.active)
              });
            });
          },
          onRegisterError(error) {
            console.error("PWA_SW_REGISTER_ERROR", {
              name: error?.name,
              message: error?.message,
            });
          },
          onNeedRefresh() {
            setNeedsUpdate(true);
            toast("Uma nova versão da Forja está disponível.", {
              action: {
                label: "Atualizar agora",
                onClick: () => window.location.reload(),
              },
              duration: Infinity,
            });
          },
          onOfflineReady() {
            toast.info("O sistema está pronto para uso offline.");
          },
        });
      });
    }

    const handleOnline = () => toast.success("Conexão restabelecida.");
    const handleOffline = () => toast.error("Você está offline.");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ForjaProvider>
        <Outlet />
        <Toaster position="top-right" closeButton theme="dark" richColors />
      </ForjaProvider>
    </QueryClientProvider>
  );
}
