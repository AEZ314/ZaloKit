import { metricsText } from "$lib/server/metrics";

export async function GET() {
  return new Response(await metricsText(), {
    headers: { "content-type": "text/plain; version=0.0.4" },
  });
}
