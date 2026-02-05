import { emailList, createEmail, sendEmail } from 'better-svelte-email/preview';

export function load() {
	const emails = emailList({
		path: '/src/lib/server/email-templates' // optional, defaults to '/src/lib/emails'
	});

	return { emails };
}

export const actions = {
	...createEmail()
};
