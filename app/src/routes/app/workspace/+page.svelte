<script>
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	import { user } from '$lib/client/state.svelte.js';
	import { authClient } from '$lib/client/auth-client';
	import { getInitials } from '$lib/utils.js';
	import { onMount } from 'svelte';

	let settings = $state({
		name: '',
		slug: '',
		logo: ''
	});
	let org = $state({});
	//$inspect(org);
	let invitations = $state({});

	onMount(async () => {
		org = await authClient.organization.getFullOrganization({
			query: {
				membersLimit: 100
			}
		});

		//invitations = await authClient.organization.listInvitations();
	});
</script>

{#if !org.data}
	loading...
{:else}
	<main class="container flex flex-col items-start justify-start gap-6 p-6">
		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="settings">
			Workspace Settings
		</h3>
		<Avatar.Root class="size-14 cursor-pointer rounded-lg">
			<Avatar.Image src={'/s3/organization/avatar/' + org.data.id} />
			<Avatar.Fallback class="rounded-lg"
				>{getInitials(org.data.name ?? 'Work Space')}</Avatar.Fallback
			>
		</Avatar.Root>
		<p>{org?.data?.name ?? 'loading...'}</p>
		<p>{org?.data?.slug ?? 'loading...'}</p>

		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="settings">People</h3>
		<div class="flex flex-col gap-4">
			{#each org.data.members as member}
				<div class="flex items-center gap-4 rounded-lg border p-4">
					<Avatar.Root class="size-14 cursor-pointer rounded-lg">
						<Avatar.Image src={'/s3/user/avatar/' + member.user.id} />
						<Avatar.Fallback class="rounded-lg"
							>{getInitials(member.user.name ?? 'User Name')}</Avatar.Fallback
						>
					</Avatar.Root>
					<div>{member.user.name}</div>
					<div>{member.role}</div>
				</div>
			{/each}
		</div>

		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="settings">Invites</h3>

		<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="settings">Teams</h3>
		<div class="flex flex-col gap-4">
			{#each org.data.teams as team}
				<div class="flex items-center gap-4 rounded-lg border p-4">
					<div>{team.name}</div>
				</div>
			{/each}
		</div>
	</main>
{/if}
