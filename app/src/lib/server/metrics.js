import client from 'prom-client';

// Guard default metrics
if (!client.register.getSingleMetric('process_cpu_user_seconds_total')) {
	client.collectDefaultMetrics();
}

// Histogram
const existingDuration = client.register.getSingleMetric('http_server_request_duration_seconds');
export const httpDuration =
	existingDuration instanceof client.Histogram
		? existingDuration
		: new client.Histogram({
				name: 'http_server_request_duration_seconds',
				help: 'HTTP request duration (seconds)',
				labelNames: ['method', 'route', 'status'],
				buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
			});

// Counter
const existingRequests = client.register.getSingleMetric('http_server_requests_total');
export const httpRequests =
	existingRequests instanceof client.Counter
		? existingRequests
		: new client.Counter({
				name: 'http_server_requests_total',
				help: 'HTTP requests total',
				labelNames: ['method', 'route', 'status']
			});

export async function metricsText() {
	return await client.register.metrics();
}
