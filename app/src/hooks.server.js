import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { logger } from '$lib/server/logger';
import { httpDuration, httpRequests } from '$lib/server/metrics';
import cron from 'node-cron';
import webpush from 'web-push';
import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';

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

// should we guard for exceptions here?
cron.schedule(
	'* * * * *',
	async () => {
		console.log('Runs every minute');
	},
	{
		timezone: 'UTC'
	}
);

const handleParaglide = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export async function handle({ event, resolve }) {
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

	return svelteKitHandler({ event, resolve, auth, building });
}
