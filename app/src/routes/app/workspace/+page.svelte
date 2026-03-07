<script>
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

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
	let invitations = $state({});

	onMount(async () => {
		org = await authClient.organization.getFullOrganization({
			query: {
				membersLimit: 100
			}
		});

		invitations = await authClient.organization.listInvitations();
	});
</script>

{#if !org.data}
	loading...
{:else}
	<main class="container flex flex-col items-center gap-6 p-6">
		<Card.Root class="my-4 w-full max-w-3xl">
			<Card.Content class="flex flex-col gap-3">
				<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="settings">
					Workspace Settings
				</h3>
				<Separator class="mt-0 mb-4" />

				<Avatar.Root class="size-14 cursor-pointer rounded-lg">
					<Avatar.Image src={'/s3/organization/avatar/' + org.data.id} />
					<Avatar.Fallback class="rounded-lg"
						>{getInitials(org.data.name ?? 'Work Space')}</Avatar.Fallback
					>
				</Avatar.Root>
				<p>{org.data.name}</p>
				<p>{org.data.slug}</p>
			</Card.Content>
		</Card.Root>

		<Card.Root class="my-4 w-full max-w-3xl">
			<Card.Content class="flex flex-col gap-3">
				<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="people">People</h3>
				<Separator class="mt-0 mb-4" />
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
			</Card.Content>
		</Card.Root>

		<Card.Root class="my-4 w-full max-w-3xl">
			<Card.Content class="flex flex-col gap-3">
				<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="invites">Invites</h3>
				<Separator class="mt-0 mb-4" />
			</Card.Content>
		</Card.Root>

		<Card.Root class="my-4 w-full max-w-3xl">
			<Card.Content class="flex flex-col gap-3">
				<h3 class="scroll-m-20 text-2xl font-semibold tracking-tight" id="teams">Teams</h3>

				<Separator class="mt-0 mb-4" />
				<div class="flex flex-col gap-4">
					{#each org.data.teams as team}
						<div class="flex items-center gap-4 rounded-lg border p-4">
							<div>{team.name}</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</main>
{/if}
