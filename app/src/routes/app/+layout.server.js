// +layout.server.ts under /app
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load = async (event) => {
	if (!event.locals.user) {
		throw redirect(303, '/home/auth?mode=login');
	}

	return {};
};
