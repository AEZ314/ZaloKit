<script>
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { getInitials } from '$lib/utils.js';

	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import SettingsIcon from '@lucide/svelte/icons/settings';

	const session = authClient.useSession();

	const sidebar = useSidebar();
	let signOutDialogOpen = false;

	async function signOut() {
		await authClient.signOut();
		goto('/home/auth?mode=login');
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={'/s3/avatar/' + $session.data?.user?.id} />
							<Avatar.Fallback class="rounded-lg"
								>{getInitials($session.data?.user?.name ?? 'User Name')}</Avatar.Fallback
							>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{$session.data?.user?.name ?? 'User Name'}</span>
							<span class="truncate text-xs"
								>{$session.data?.user?.email ?? 'user@example.com'}</span
							>
						</div>
						<ChevronsUpDownIcon class="ms-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={'/s3/avatar/' + $session.data?.user?.id} />
							<Avatar.Fallback class="rounded-lg"
								>{getInitials($session.data?.user?.name ?? 'User Name')}</Avatar.Fallback
							>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{$session.data?.user?.name ?? 'User Name'}</span>
							<span class="truncate text-xs"
								>{$session.data?.user?.email ?? 'user@example.com'}</span
							>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<a href="/app/settings" class="flex w-full items-center gap-2">
							<SettingsIcon />
							<span>Settings</span>
						</a>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<a href="/app/settings#account" class="flex w-full items-center gap-2">
							<BadgeCheckIcon />
							<span>Account</span>
						</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<a href="/app/settings#billing" class="flex w-full items-center gap-2">
							<CreditCardIcon />
							<span>Billing</span>
						</a>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<a href="/app/settings#notifications" class="flex w-full items-center gap-2">
							<BellIcon />
							<span>Notification</span>
						</a>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					{#if signOutDialogOpen}
						<LogOutIcon />
						Sure?
						<Button variant="destructive" size="icon-sm"
							><button on:click={() => signOut()}>yes</button></Button
						>
						<Button variant="outline" size="icon-sm"
							><button on:click={() => (signOutDialogOpen = false)}>no</button></Button
						>
					{:else}
						<button
							on:click={() => (signOutDialogOpen = true)}
							class="flex w-full items-center gap-2"
						>
							<LogOutIcon />
							<span>Sign Out</span>
						</button>
					{/if}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
