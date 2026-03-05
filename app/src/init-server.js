import { logger } from '$lib/server/logger';

import { user } from '$schema';
import { db } from '$lib/server/db';
import { auth } from '$lib/server/auth';

import cron from 'node-cron';
import webpush from 'web-push';

// make this module HMR re-run resistant?

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

webpush.setVapidDetails(
	`mailto:${process.env.PUBLIC_SUPPORT_EMAIL}`,
	process.env.PUBLIC_VAPID_KEY,
	process.env.PRIVATE_VAPID_KEY
);

// Seed the DB
logger.info('Seeding DB...');
try {
	// create seed users etc.
} catch (err) {
	logger.error(err, 'Error occurred while seeding DB');
}
