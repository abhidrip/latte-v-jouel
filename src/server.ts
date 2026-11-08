import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      if (response.status >= 500) {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const body = await response.clone().text();
          const captured = consumeLastCapturedError();
          const err = captured ?? new Error(`SSR Status ${response.status} for URL: ${request.url}\nBody: ${body}\nHeaders: ${JSON.stringify(Object.fromEntries(request.headers.entries()))}`);
          console.error(err);
          return new Response(renderErrorPage(err), {
            status: 500,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
      }
      return response;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(error), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
