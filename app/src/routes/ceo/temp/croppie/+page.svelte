<script>
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import { Button } from '$lib/components/ui/button/index.js';

	import { onMount } from 'svelte';
	import Croppie from 'croppie';
	import 'croppie/croppie.css';

	let croppieEl;
	let wrapperEl;
	let croppie;

	// temp test image
	const imageUrl = 'https://picsum.photos/536/354';
	let aspectRatio = 1; // 1 = square. Use 16/9 etc if needed.

	async function initCroppie() {
		console.log('Initializing Croppie with image:', croppie);

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

		await croppie.bind({ url: imageUrl });
	}

	onMount(() => {});
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<CirclePlus size="16" />
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Upload Profile Picture</Dialog.Title>
			<Dialog.Description>
				<div bind:this={wrapperEl} class="w-full">
					<div bind:this={croppieEl}></div>
				</div>
				<Button onclick={() => initCroppie()}>Select File</Button>
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="sm:justify-start">
			<Dialog.Close class={buttonVariants({ variant: 'ghost' })}>Cancel</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
