import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../context/CartContext";
import { AppReadyProvider } from "../context/AppReadyContext";
import { WishlistProvider } from "../context/WishlistContext";
import { LoadingScreen } from "../components/LoadingScreen";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="not-found-page">
      <div className="not-found-page__eyebrow">Lattév Jouel</div>
      <div className="not-found-page__headline" aria-hidden="true">404</div>
      <h1 className="not-found-page__title">This piece doesn't exist.</h1>
      <p className="not-found-page__sub">
        The page you're looking for may have moved, or the URL is incorrect.
      </p>
      <div style={{ marginTop: "2.5rem" }}>
        <Link
          to="/"
          className="liquid-glass-btn"
        >
          Return to Maison
        </Link>
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
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {error?.message || "This page didn't load"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-left whitespace-pre-wrap font-mono text-xs text-red-500 overflow-auto max-h-64">
          {error?.stack || "Something went wrong on our end. You can try refreshing or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lattév Jouel — Fine Contemporary Jewellery" },
      { name: "description", content: "Lattév Jouel: fine contemporary jewellery handcrafted in India. Rings, cuffs, bangles, bracelets and pendants." },
      { property: "og:title", content: "Lattév Jouel — Fine Contemporary Jewellery" },
      { property: "og:description", content: "Crafted for the bold. Made to be worn." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/lattev_transparent.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/lattev_transparent.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Kaushan+Script&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Kaushan+Script&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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

  return (
    <QueryClientProvider client={queryClient}>
      <AppReadyProvider>
        <WishlistProvider>
          <CartProvider>
            {/* Loading screen — shows on initial visit, auto-dismisses after 3s */}
            <LoadingScreen />
            <Toaster />
            {/* Required: nested routes render here */}
            <Outlet />
          </CartProvider>
        </WishlistProvider>
      </AppReadyProvider>
    </QueryClientProvider>
  );
}
