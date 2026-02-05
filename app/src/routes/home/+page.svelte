<script>
	import { env } from '$env/dynamic/public';

	import Counter from './Counter.svelte';
</script>

<section>
	<h2>
		dynamic message: {env.PUBLIC_DYNAMIC_MESSAGE}
	</h2>

	<Counter />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
