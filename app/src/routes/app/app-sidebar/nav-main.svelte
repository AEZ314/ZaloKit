<script>
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Check from '@lucide/svelte/icons/check';
	import CheckCheck from '@lucide/svelte/icons/check-check';
	import Users from '@lucide/svelte/icons/users';
	import CircleQuestionMark from '@lucide/svelte/icons/circle-question-mark';
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>

	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<Sidebar.MenuButton>
				{#snippet child({ props })}
					<a href="/app" {...props}>
						<LayoutDashboard />
						<span>Dashboard</span>
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
								<CircleQuestionMark class="ml-auto text-muted-foreground" {...props}/>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content>View your dashboard.</Tooltip.Content>
						</Tooltip.Root>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>

		<Sidebar.MenuItem>
			<Sidebar.MenuButton>
				{#snippet child({ props })}
					<a href="/app/my-tasks" {...props}>
						<Check />
						<span>My Tasks</span>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>

		<Sidebar.MenuItem>
			<Sidebar.MenuButton>
				{#snippet child({ props })}
					<a href="/app/all-tasks" {...props}>
						<CheckCheck />
						<span>All Tasks</span>
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>

		<Collapsible.Root class="group/collapsible">
			{#snippet child({ props })}
				<Sidebar.MenuItem {...props}>
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton {...props}>
								<Users />

								<span>Team</span>
								<ChevronRightIcon
									class="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
								/>
							</Sidebar.MenuButton>
						{/snippet}
					</Collapsible.Trigger>
					<Collapsible.Content>
						<Sidebar.MenuSub>
							<Sidebar.MenuSubItem>
								<Sidebar.MenuSubButton>
									{#snippet child({ props })}
										<a href="/app/team#members" {...props}>
											<span>Members</span>
										</a>
									{/snippet}
								</Sidebar.MenuSubButton>
							</Sidebar.MenuSubItem>

							<Sidebar.MenuSubItem>
								<Sidebar.MenuSubButton>
									{#snippet child({ props })}
										<a href="/app/team#settings" {...props}>
											<span>Settings</span>
										</a>
									{/snippet}
								</Sidebar.MenuSubButton>
							</Sidebar.MenuSubItem>
						</Sidebar.MenuSub>
					</Collapsible.Content>
				</Sidebar.MenuItem>
			{/snippet}
		</Collapsible.Root>
	</Sidebar.Menu>
</Sidebar.Group>
