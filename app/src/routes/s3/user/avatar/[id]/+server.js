import { logger } from '$lib/server/logger';

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3 } from '$lib/server/s3';
import { json, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

import { user } from '$schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

const bucket = process.env.S3_BUCKET;

// todo: set up authorization checks here
export const GET = async (event) => {
	const { id } = event.params;

	if (!id) return json({ error: 'Missing [id]' }, { status: 401 });
	if (!event.locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const res = await db.select({ image: user.image }).from(user).where(eq(user.id, id)).limit(1);
	const img = res[0]?.image;
	if (!img) return json({ error: 'User not found or no image set' }, { status: 404 });

	// If the image field starts with http, we assume it's an external url (e.g. from Sign in with Google) and redirect to that url instead of presigning a url from S3
	if (img.startsWith('http')) throw redirect(302, img);

	const url = await getSignedUrl(
		s3,
		new GetObjectCommand({
			Bucket: bucket,
			Key: img
		}),
		{ expiresIn: 60 }
	);

	throw redirect(302, url);
};

// I originially wanted to expose a PUT url for direct uploads to S3 (via redirect to signed url upon successfull auth checks), but that meant the initial PUT fetch would send the file Sveltekit before the redirect, which we don't want. It also clashed with Sveltekit's maximum body size limits...
export const POST = async (event) => {
	if (!event.locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	// S3 object key
	const key = `user/avatar/${event.locals.user.id}`;

	// when a user signs in with Google etc. the image field is populated with the provider's image url, so we only want to update the user's image field to our S3 key if it's not already set or if it's already set to a url (indicating it's from a provider)
	if (
		!event.locals.user.image ||
		event.locals.user.image === '' ||
		event.locals.user.image.startsWith('http')
	)
		await auth.api.updateUser({ body: { image: key }, headers: event.request.headers });

	// S3 will enforce conditions only for presigned POST requests (and not presigned PUT requests [no clue why lol])
	const presigned = await createPresignedPost(s3, {
		Bucket: bucket,
		Key: key,
		Fields: {
			'Content-Type': 'image/png'
		},
		Conditions: [
			['content-length-range', 0, 1_000_000 * process.env.PUBLIC_MAX_AVATAR_SIZE_MB], // S3 enforces size
			['starts-with', '$Content-Type', 'image/']
		],
		Expires: 60 // seconds
	});

	return json({
		url: presigned.url,
		fields: presigned.fields,
		key
	});
};
