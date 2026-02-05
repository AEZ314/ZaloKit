<script>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	let { open = $bindable(false), ...restProps } = $props();
</script>

<MenubarPrimitive.Sub bind:open {...restProps} />