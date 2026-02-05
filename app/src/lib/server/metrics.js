import client from "prom-client";

client.collectDefaultMetrics();

export const httpDuration = new client.Histogram({
  name: "http_server_request_duration_seconds",
  help: "HTTP request duration (seconds)",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const httpRequests = new client.Counter({
  name: "http_server_requests_total",
  help: "HTTP requests total",
  labelNames: ["method", "route", "status"],
});

export async function metricsText() {
  return await client.register.metrics();
}
