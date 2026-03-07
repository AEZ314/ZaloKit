import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../schemas/index.js'; // can't use $schema her because npm run auth:generate uses raw node, which doesn't understand path aliases
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
	connectionString: env.DATABASE_URL
});

export const db = drizzle(pool, { schema });
