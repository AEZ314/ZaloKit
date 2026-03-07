import { authClient } from '$lib/client/auth-client';

// note: don't expose the user's active organization from state.svelte.js, because that would make it too easy for the client to get into an out of sync state with the server (e.g. other organization member updates it from their browser). So instead, fetch the active organization per page whenever needed.
export let user = $state({ current: null });
