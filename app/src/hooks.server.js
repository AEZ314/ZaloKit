import { logger } from '$lib/server/logger';

import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { httpDuration, httpRequests } from '$lib/server/metrics';
import cron from 'node-cron';
import webpush from 'web-push';
import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';
import { posthog } from '$lib/server/posthog';
import path from 'path';

// should we guard for exceptions here?
cron.schedule(
	'* * * * *',
	async () => {
		// console.log('Runs every minute');
	},
	{
		timezone: 'UTC'
	}
);

// This is a global limiter, but can limit individual +page.server.js files as well
const limiter = new RetryAfterRateLimiter({
	IP: [
		[100, 'm'],
		[10, 's']
	]
});

webpush.setVapidDetails(
	`mailto:${process.env.PUBLIC_SUPPORT_EMAIL}`,
	process.env.PUBLIC_VAPID_KEY,
	process.env.PRIVATE_VAPID_KEY
);

const handleParaglide = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

// Section: SvelteKit Handlers

export const handleError = ({ error, event }) => {
	let ignore = false;
	if (event.url.pathname.endsWith('.map')) ignore = true; // ignore source map errors

	if (!ignore)
		logger.error(
			{
				method: event.request.method,
				url: event.url.pathname,
				message: error.message,
				user: event.locals?.user?.id ?? null
			},
			'Unhandled server error'
		);

	// Sanitized error for client
	return {
		message: 'Internal error'
	};
};

export async function handle({ event, resolve }) {
	const start = performance.now();

	// rate limit check
	const status = await limiter.check(event);
	if (status.limited) {
		let response = new Response(
			`You are being rate limited. Please try after ${status.retryAfter} seconds.`,
			{
				status: 429,
				headers: { 'Retry-After': status.retryAfter.toString() }
			}
		);
		return response;
	}

	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	// Handle request
	const response = await svelteKitHandler({ event, resolve, auth, building });

	const ms = performance.now() - start;

	// Skip logging for certain requests (e.g. source map errors)
	let ignore = false;
	if (event.url.pathname.endsWith('.map')) ignore = true; // ignore source map errors

	if (ignore) return response;

	// LOGGING

	// metrics
	const route = event.route?.id ?? event.url.pathname; // route paramerizes slugs/query strings hence fewer labels for Prometheus
	const labels = [event.request.method, route, String(response.status)];
	httpDuration.labels(...labels).observe(ms / 1000);
	httpRequests.labels(...labels).inc(1);

	// pino
	logger.debug(
		{
			method: event.request.method,
			path: event.url.pathname,
			status: response.status,
			ms: Math.round(ms)
		},
		'request'
	);

	// posthog analytics
	posthog.capture({
		distinctId: event.locals?.user?.id ?? 'anonymous',
		event: 'request',
		properties: {
			method: event.request.method,
			route,
			status: response.status,
			ms
		}
	});

	return response;
}
