import * as z from 'zod';

export const account = z.object({
	name: z.string().min(2).max(50),
	email: z.email(),
	password: z.string().min(8)
});
