<script>
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	function urlBase64ToUint8Array(base64String) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

		const rawData = atob(base64);
		return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
	}

	async function subscribe() {
		const permission = await Notification.requestPermission();
		if (permission !== 'granted') return;

		const registration = await navigator.serviceWorker.ready;

		const existing = await registration.pushManager.getSubscription();
		if (existing) return existing;

		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(env.PUBLIC_VAPID_KEY)
		});

		console.log('Subscription:', subscription);

		// await fetch('/api/push/subscribe', {
		// 	method: 'POST',
		// 	headers: { 'Content-Type': 'application/json' },
		// 	body: JSON.stringify(subscription)
		// });
	}
</script>

<button on:click={subscribe}> Enable Notifications, </button>
