import { createAuthClient } from 'better-auth/svelte';
import { emailOTPClient } from 'better-auth/client/plugins';
import {
	organizationClient,
	phoneNumberClient,
	adminClient,
	apiKeyClient
} from 'better-auth/client/plugins';
import { stripeClient } from '@better-auth/stripe/client';
import { passkeyClient } from '@better-auth/passkey/client';

export const authClient = createAuthClient({
	plugins: [
		passkeyClient(),
		emailOTPClient(),
		phoneNumberClient(),
		organizationClient(),
		adminClient(),
		apiKeyClient(),
		stripeClient({
			subscription: true //if you want to enable subscription management
		})
	]
});
