import { pgTable, serial, integer, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user, organization } from './auth';

export const post = pgTable('post', {
	id: serial('id').primaryKey(),
	title: text('title').notNull()
});

export const appUser = pgTable('app_user', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	lastOrgId: text('last_org_id').references(() => organization.id, { onDelete: 'set null' })
});
