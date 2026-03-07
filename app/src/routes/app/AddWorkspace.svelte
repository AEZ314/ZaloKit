<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	const { trigger } = $props();

	let dialogOpen = $state(false);
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger>
		{@render trigger()}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Workspace</Dialog.Title>
			<Dialog.Description></Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="sm:justify-start">
			<!-- <Dialog.Close class={buttonVariants({ variant: 'ghost' })}>Cancel</Dialog.Close> -->
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
