import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { post } from '$lib/server/db/schema';

export async function GET() {
	const data = await db.select().from(post);

	return json(data);
}

export async function POST({ request, cookies }) {
	const req = await request.json();

	const data = await db
		.insert(post)
		.values({
			title: req.title
		})
		.returning();

	return json(data);
}
