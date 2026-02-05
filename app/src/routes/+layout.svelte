<script>
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import '../app.css';
	import { onMount } from 'svelte';
	import { initPostHog } from '$lib/posthog';
	import { ModeWatcher } from 'mode-watcher'; // shadcn UI component for theme detection
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	onMount(() => {
		initPostHog();
	});
</script>

<ModeWatcher />
<Toaster />

<div class="app">
	<main>
		{@render children()}
	</main>
</div>
