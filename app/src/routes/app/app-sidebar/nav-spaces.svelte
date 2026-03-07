<script>
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import { onMount } from 'svelte';
	import { authClient } from '$lib/client/auth-client';
	import { toast } from 'svelte-sonner';
	import { getInitials } from '$lib/utils.js';

	import AddWorkspace from '../AddWorkspace.svelte';

	const sidebar = useSidebar();

	const organizations = authClient.useListOrganizations();
	let activeOrganization = $state({});

	const store = authClient.useActiveOrganization();
	$effect(() => {
		if ($store.data) {
			activeOrganization = $store.data;
		}
	});

	async function setActiveOrganization(org) {
		const { data, error } = await authClient.organization.setActive({
			organizationId: org.id
		});

		if (error) {
			toast.error(`Failed to set active organization: ${error.message}`);
		} else {
			activeOrganization = org;
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
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={'/s3/organization/avatar/' + activeOrganization?.id} />
							<Avatar.Fallback class="rounded-lg"
								>{getInitials(activeOrganization?.name ?? 'Work Space')}</Avatar.Fallback
							>
						</Avatar.Root>

						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">
								{activeOrganization?.name ?? 'Workspace'}
							</span>
							<span class="truncate text-xs">{activeOrganization?.plan ?? 'free tier'}</span>
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
					{#each $organizations.data as org, index (org.name)}
						<DropdownMenu.Item class="gap-2 p-2" onSelect={() => setActiveOrganization(org)}>
							<Avatar.Root class="size-8 rounded-lg">
								<Avatar.Image src={'/s3/organization/avatar/' + org.id} />
								<Avatar.Fallback class="rounded-lg"
									>{getInitials(org.name ?? 'Work Space')}</Avatar.Fallback
								>
							</Avatar.Root>
							{org.name}
						</DropdownMenu.Item>
					{/each}
				{/if}
				<DropdownMenu.Separator />

				<AddWorkspace>
					{#snippet trigger()}
						<DropdownMenu.Item class="gap-2 p-2">
							<div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
								<PlusIcon class="size-4" />
							</div>
							<div class="font-medium text-muted-foreground">Create or join workspace</div>
						</DropdownMenu.Item>
					{/snippet}
				</AddWorkspace>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
