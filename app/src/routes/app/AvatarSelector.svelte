<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import 'croppie/croppie.css';
	import Croppie from 'croppie';

	const { trigger, title, onSubmit } = $props();

	let dialogOpen = $state(false);
	$effect(() => {
		if (!dialogOpen) {
			// destroy croppie instance when dialog is closed
			if (croppie) {
				croppie.destroy();
				croppie = null;
			}
			file = null;
		}
	});

	let croppie;
	let fileInputEl;
	let croppieEl;
	let wrapperEl;
	let aspectRatio = 1;
	let file = $state(null);

	async function onProfilePictureChange(e) {
		const input = e.currentTarget;
		file = input.files?.[0] ?? file;

		initCroppie();
	}

	async function initCroppie() {
		// check if already initialized
		if (!croppie) {
			const width = wrapperEl.clientWidth;
			const height = width / aspectRatio;

			croppie = new Croppie(croppieEl, {
				viewport: {
					width: width * 0.8,
					height: (width * 0.8) / aspectRatio,
					type: aspectRatio === 1 ? 'square' : 'square'
				},
				boundary: {
					width,
					height
				}
			});
		}

		await croppie.bind({ url: URL.createObjectURL(file) });
	}
</script>

<input
	type="file"
	accept="image/*"
	class="hidden"
	bind:this={fileInputEl}
	onchange={onProfilePictureChange}
/>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger>
		{@render trigger()}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				<div bind:this={wrapperEl} class="w-full">
					<div bind:this={croppieEl}></div>
				</div>
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="sm:justify-start">
			<Dialog.Close class={buttonVariants({ variant: 'ghost' })}>Cancel</Dialog.Close>
			<Button class="ml-auto" onclick={() => fileInputEl.click()}>Select Picture</Button>
			<Button
				variant="secondary"
				disabled={!file}
				onclick={() => {
					dialogOpen = false;
					onSubmit(croppie);
				}}>Continue</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
