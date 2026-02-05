// src/lib/server/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION;
const bucket = process.env.S3_BUCKET;

if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
	throw new Error('S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY not set');
}

export const s3 = new S3Client({
	region,
	endpoint: endpoint || undefined,
	// SeaweedFS S3 and most self-hosted endpoints need path-style URLs:
	forcePathStyle: Boolean(endpoint),
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
	}
});
