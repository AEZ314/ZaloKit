<script>
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import { authClient } from '$lib/auth-client';
	import { toast } from 'svelte-sonner';
	import { getInitials } from '$lib/utils.js';

	const sidebar = useSidebar();
	const organizations = authClient.useListOrganizations();

	let activeTeam = $state('');
	async function setActiveOrganization(org) {
		const { data, error } = await authClient.organization.setActive({
			organizationId: org.id
		});

		if (error) {
			toast.error(`Failed to set active organization: ${error.message}`);
		} else {
			activeTeam = org;
			toast.success(`Active organization set to ${org.name}`);
		}
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<div
							class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
						>
							🔥
							<!-- <activeTeam.logo class="size-4" /> -->
						</div>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">
								{activeTeam.name}
							</span>
							<span class="truncate text-xs">{activeTeam.plan}</span>
						</div>
						<ChevronsUpDownIcon class="ms-auto" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>

			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				align="start"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				sideOffset={4}
			>
				<DropdownMenu.Label class="text-xs text-muted-foreground">Workspaces</DropdownMenu.Label>

				{#if $organizations.isPending}
					<p>Loading...</p>
				{:else if !$organizations.data?.length}
					<p>No organizations found.</p>
				{:else}
					{#each $organizations.data as space, index (space.name)}
						<DropdownMenu.Item class="gap-2 p-2" onSelect={() => setActiveOrganization(space)}>
							<Avatar.Root class="size-8 rounded-lg">
								<Avatar.Image src={'/s3/avatar/organization/' + space.id} />
								<Avatar.Fallback class="rounded-lg"
									>{getInitials(space.name ?? 'Work Space')}</Avatar.Fallback
								>
							</Avatar.Root>
							{space.name}
						</DropdownMenu.Item>
					{/each}
				{/if}
				<DropdownMenu.Separator />

				<DropdownMenu.Item class="gap-2 p-2">
					<div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
						<PlusIcon class="size-4" />
					</div>
					<div class="font-medium text-muted-foreground">Add workspace</div>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
