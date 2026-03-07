import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import { auth } from '$lib/server/auth';
import { user } from '$schema';

export async function userCreated(user) {}
