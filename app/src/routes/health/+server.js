// src/routes/health/+server.js
export const GET = async () => {
	// perform any necessary health checks here (e.g., database connectivity, external service status, etc.)

	return new Response(JSON.stringify({ status: 'ok' }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store'
		}
	});
};
