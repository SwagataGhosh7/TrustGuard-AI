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

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { executeFullScan } from "./server/scanner";
import { addThreatReport, getAllThreats, voteThreatReport } from "./server/threat-store";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ping") {
      return new Response(JSON.stringify({ pong: true }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/scan" && request.method === "POST") {
      try {
        const body = (await request.json()) as { targetUrl?: string };
        if (!body.targetUrl || typeof body.targetUrl !== "string") {
          return new Response(JSON.stringify({ error: "Missing or invalid targetUrl parameter" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const result = await executeFullScan(body.targetUrl);
        return new Response(JSON.stringify(result), {
          headers: { "content-type": "application/json" },
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(JSON.stringify({ error: message }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }
    }

    if (url.pathname === "/api/threats" && request.method === "GET") {
      const threats = getAllThreats();
      return new Response(JSON.stringify(threats), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/threats" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          domain: string;
          vector: string;
          severity: "Critical" | "High" | "Medium" | "Low";
          reporter?: string;
          notes: string;
          tags?: string[];
        };
        const created = addThreatReport(body);
        return new Response(JSON.stringify(created), {
          status: 201,
          headers: { "content-type": "application/json" },
        });
      } catch (err: unknown) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }
    }

    if (url.pathname === "/api/threats/vote" && request.method === "POST") {
      try {
        const body = (await request.json()) as { id: string; delta: number };
        const updated = voteThreatReport(body.id, body.delta || 1);
        if (!updated) {
          return new Response(JSON.stringify({ error: "Threat report not found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(JSON.stringify(updated), {
          headers: { "content-type": "application/json" },
        });
      } catch (err: unknown) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }
    }
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
