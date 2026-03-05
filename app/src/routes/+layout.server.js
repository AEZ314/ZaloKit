// +layout.server.ts under /app
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load = async (event) => {
	// when you call invalidate('app:auth') on the client, it will cause this load function to run again and re-check the user's auth status, which is useful for things like logging out where we want to immediately reflect the new auth status on the client without a full page refresh
	event.depends('app:auth');

	return { user: event.locals.user };
};
