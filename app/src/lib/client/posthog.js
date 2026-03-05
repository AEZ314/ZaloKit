import posthog from 'posthog-js';
import { env } from '$env/dynamic/public';

export function initPostHog() {
	// Avoid double-init in dev HMR
	if (posthog.__initialized) return;

	posthog.init(env.PUBLIC_POSTHOG_KEY, {
		api_host: 'https://app.posthog.com', // e.g. https://app.posthog.com or your self-hosted URL
		session_recording: {
			// These map to rrweb options; PostHog notes defaults and masking behavior depend on project settings
			maskAllInputs: false
		}
	});

	posthog.__initialized = true;
}
