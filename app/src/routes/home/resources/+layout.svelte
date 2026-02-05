<script>
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { page } from '$app/stores';

	const { data, children } = $props();

	let lastSegment = $page.url.pathname.split('/').filter(Boolean).at(-1).replace('%20', ' ') ?? '';
	let currentPage = $state(lastSegment);
</script>

<div class="relative h-full">
	<Sidebar.Provider>
		<Sidebar.Root collapsible="offcanvas" class="absolute h-full">
			<Sidebar.Header>Resources</Sidebar.Header>
			<Sidebar.Content>
				{#each data.groups as group (group.category)}
					<Sidebar.Group>
						<Sidebar.GroupLabel>{group.category}</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								{#each group.pages as item (item.title)}
									<Sidebar.MenuItem>
										<Sidebar.MenuButton>
											<a href={item.href} onclick={() => (currentPage = item.title)}>{item.title}</a
											>
										</Sidebar.MenuButton>
									</Sidebar.MenuItem>
								{/each}
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				{/each}
			</Sidebar.Content>
			<Sidebar.Rail />
		</Sidebar.Root>

		<Sidebar.Inset>
			<div class="w-full">
				<header class="h-16 gap-2 px-4 flex w-full shrink-0 items-center border-b">
					<Sidebar.Trigger class="-ms-1" />

					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item>
								<Breadcrumb.Link>Resources</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator />
							<Breadcrumb.Item>
								<Breadcrumb.Page>{currentPage}</Breadcrumb.Page>
							</Breadcrumb.Item>
						</Breadcrumb.List>
					</Breadcrumb.Root>
				</header>
			</div>

			<main class="prose">
				{@render children()}
			</main>
		</Sidebar.Inset>
	</Sidebar.Provider>
</div>

<style>
	main {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}
</style>
