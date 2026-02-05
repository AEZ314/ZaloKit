<script module>
	import AudioWaveformIcon from '@lucide/svelte/icons/audio-waveform';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import BotIcon from '@lucide/svelte/icons/bot';
	import ChartPieIcon from '@lucide/svelte/icons/chart-pie';
	import CommandIcon from '@lucide/svelte/icons/command';
	import FrameIcon from '@lucide/svelte/icons/frame';
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import MapIcon from '@lucide/svelte/icons/map';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import SquareTerminalIcon from '@lucide/svelte/icons/square-terminal';
</script>

<script>
	import NavMain from './nav-main.svelte';
	import NavResources from './nav-resources.svelte';
	import NavUser from './nav-user.svelte';
	import TeamSwitcher from './nav-spaces.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import NavSpaces from './nav-spaces.svelte';
	let { ref = $bindable(null), collapsible = 'icon', ...restProps } = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header>
		<NavSpaces />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain />
		<div class="h-full"></div>
		<NavResources />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
