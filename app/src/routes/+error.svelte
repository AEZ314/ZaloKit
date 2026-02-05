<script>
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
</script>

<svelte:head>
	<title>{page.status}</title>
</svelte:head>

<div class="wrapper">
	<h1>{page.status}</h1>

	<p>{page.status}: {page.error?.message ?? 'An unexpected error occurred.'}</p>

	<a href="/">Return Home</a>
	<a href="/app">Return Dashboard</a>
	<a href="mailto:{env.PUBLIC_SUPPORT_EMAIL}">Contact Support</a>
</div>

<style>
	.wrapper {
		height: 100vh;
		display: grid;
		place-content: center;
		text-align: center;
		font-family: system-ui, sans-serif;
	}

	h1 {
		font-size: 4rem;
		margin: 0;
	}

	p {
		opacity: 0.8;
	}

	a {
		margin-top: 1rem;
		display: inline-block;
		text-decoration: underline;
	}
</style>
