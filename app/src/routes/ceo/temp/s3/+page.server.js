// +page.server.js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '$lib/server/s3';

export async function load() {
	const bucket = process.env.S3_BUCKET;

	const key = 'test/img.png';

	try {
		const write = await getSignedUrl(
			s3,
			new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				ContentType: 'image/png'
			}),
			{ expiresIn: 60 }
		);

		const read = await getSignedUrl(
			s3,
			new GetObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: key
			}),
			{ expiresIn: 60 }
		);

		return { ok: true, write, read, key };
	} catch (e) {
		console.log(e);
		return {
			ok: false,
			error: e?.message || String(e)
		};
	}
}
