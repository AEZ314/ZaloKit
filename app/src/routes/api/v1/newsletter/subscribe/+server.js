import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

import { mg } from '$lib/server/mailgun.js';
import formData from 'form-data';

function isEmail(s) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST({ request }) {
	const body = await request.json().catch(() => null);
	const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

	if (!isEmail(email)) {
		return json({ ok: false, error: 'Invalid email' }, { status: 400 });
	}

	try {
		const listAddress = process.env.MAILGUN_LIST_ADDRESS;
		const r = await mg.lists.members.createMember(listAddress, {
			address: email,
			subscribed: 'yes',
			upsert: 'yes'
		});
		return json({ ok: true });
	} catch (err) {
		return json({ ok: false, error: 'Subscribe failed' }, { status: 502 });
	}
}
