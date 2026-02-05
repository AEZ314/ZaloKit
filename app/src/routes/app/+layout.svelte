<script>
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from './app-sidebar/sidebar.svelte';
	import Header from './Header.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { onMount } from 'svelte';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AppSidebar />
	<Sidebar.Inset>
		<Header />
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
