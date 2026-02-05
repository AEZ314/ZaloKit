<script>
	import { Menubar as MenubarPrimitive } from "bits-ui";

	let { ...restProps } = $props();
</script>

<MenubarPrimitive.Portal {...restProps} />