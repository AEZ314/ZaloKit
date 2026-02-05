import { pgTable, serial, integer, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const post = pgTable('post', {
	id: serial('id').primaryKey(),
	title: text('title').notNull()
});
