<script>
	import EmailPreview from 'better-svelte-email/preview/EmailPreview.svelte';
	import { page } from '$app/state';
</script>

<EmailPreview {page} />
