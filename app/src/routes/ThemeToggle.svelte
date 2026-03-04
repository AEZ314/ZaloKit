<script>
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunMoonIcon from '@lucide/svelte/icons/sun-moon';
	import CloudSunIcon from '@lucide/svelte/icons/cloud-sun';
	import { Button } from '$lib/components/ui/button/index.js';

	import { cycleTheme } from '$lib/client/theme.js';
</script>

<Button onclick={cycleTheme} variant="outline" size="icon">
	<SunIcon
		class="h-[1.2rem] w-[1.2rem] scale-0 -rotate-90 !transition-all in-[.light]:scale-100 in-[.light]:rotate-0"
	/>
	<CloudSunIcon
		class="absolute h-[1.2rem] w-[1.2rem] scale-0 -rotate-90 !transition-all in-[.soft]:scale-100 in-[.soft]:rotate-0"
	/>
	<MoonIcon
		class="absolute h-[1.2rem] w-[1.2rem] scale-0 -rotate-90 !transition-all dark:scale-100 dark:rotate-0"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
