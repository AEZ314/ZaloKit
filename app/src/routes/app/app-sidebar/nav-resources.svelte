<script>
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import MegaphoneIcon from '@lucide/svelte/icons/megaphone';

	const sidebar = useSidebar();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Resources</Sidebar.GroupLabel>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton>
				{#snippet child({ props })}
					<a href="/home/pricing" {...props}>
						<SparklesIcon />
						<span>Upgrade to Pro</span>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>

		<Sidebar.MenuItem>
			<Sidebar.MenuButton>
				{#snippet child({ props })}
					<a href="/home/resources/About/Getting%20Started" {...props}>
						<BookOpenIcon />
						<span>Documentation</span>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>

		<Sidebar.MenuItem>
			<Sidebar.MenuButton>
				{#snippet child({ props })}
					<a href="/home/community" {...props}>
						<MegaphoneIcon />
						<span>Community</span>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</Sidebar.Group>
