<script>
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import '../app.css';
	import { onMount } from 'svelte';
	import { initPostHog } from '$lib/client/posthog';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import ThemeInit from '$lib/client/ThemeInit.svelte';

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
