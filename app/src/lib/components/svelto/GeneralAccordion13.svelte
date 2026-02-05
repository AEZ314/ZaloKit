<!-- @free -->
<!-- @medium -->
<!-- @description Tabs accordion with left chevron -->
<script>
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const items = [
		{
			id: '1',
			title: 'What makes SveltoUI different?',
			content:
				'SveltoUI focuses on developer experience and performance. Built with TypeScript, it offers type-safe components that are both beautiful and functional.'
		},
		{
			id: '2',
			title: 'How can I customize the components?',
			content:
				'Use our CSS variables for global styling, or customize individual components using Tailwind classes. We provide extensive documentation for all customization options.'
		},
		{
			id: '3',
			title: 'Is SveltoUI accessible?',
			content:
				'Yes! We follow WAI-ARIA guidelines and test with screen readers to ensure all components are accessible to everyone.'
		}
	];

	let openItem = $state(items[0].id);

	function toggleItem(id) {
		openItem = openItem === id ? null : id;
	}
</script>

<!-- Tabs accordion with left chevron -->
<div class="mx-auto w-full max-w-lg space-y-2">
	{#each items as item (item.id)}
		<div class="rounded-lg border">
			<button
				type="button"
				onclick={() => toggleItem(item.id)}
				class="hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition-colors {openItem ===
				item.id
					? 'rounded-b-none'
					: ''}"
				aria-expanded={openItem === item.id}
			>
				<ChevronRight
					class="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 {openItem ===
					item.id
						? 'rotate-90'
						: ''}"
					aria-hidden="true"
				/>
				<span class="text-sm">{item.title}</span>
			</button>
			{#if openItem === item.id}
				<div class="px-4 pb-4 pl-11">
					<p class="text-muted-foreground text-sm">{item.content}</p>
				</div>
			{/if}
		</div>
	{/each}
</div>
