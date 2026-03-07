<script>
	import { page } from '$app/stores';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import '../app.css';
	import { onMount } from 'svelte';
	import { initPostHog } from '$lib/client/posthog';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import ThemeInit from '$lib/client/ThemeInit.svelte';

	import { user } from '$lib/client/state.svelte.js';

	// user.current = $page.data.user isn't reactive to invalidate('auth:user') by itself, so we need $effect
	user.current = $page.data.user;
	$effect(() => {
		user.current = $page.data.user;
	});

	let { children } = $props();

	onMount(() => {
		initPostHog();
	});
</script>

<ThemeInit />
<Toaster />

<div class="app">
	<main>
		{@render children()}
	</main>
</div>
