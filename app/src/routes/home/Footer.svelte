<script>
	import { Button } from '$lib/components/ui/button/index';
	import { Input } from '$lib/components/ui/input/index';
	import { cn } from '$lib/utils.js';
	import { Facebook, Instagram, Twitter, Github, Youtube } from '@lucide/svelte';

	const defaultNavigation = {
		solutions: [
			{ name: 'Development', href: '#' },
			{ name: 'Consulting', href: '#' },
			{ name: 'Integration', href: '#' },
			{ name: 'Solutions', href: '#' },
			{ name: 'Research', href: '#' }
		],
		support: [
			{ name: 'Contact us', href: '#' },
			{ name: 'Help center', href: '#' },
			{ name: 'Resources', href: '#' }
		],
		company: [
			{ name: 'Company', href: '#' },
			{ name: 'News', href: '#' },
			{ name: 'Careers', href: '#' },
			{ name: 'Media', href: '#' }
		],
		legal: [
			{ name: 'Terms & conditions', href: '#' },
			{ name: 'Privacy notice', href: '#' },
			{ name: 'Licensing', href: '#' }
		],
		social: [
			{ name: 'Facebook', href: '#', icon: Facebook },
			{ name: 'Instagram', href: '#', icon: Instagram },
			{ name: 'X', href: '#', icon: Twitter },
			{ name: 'GitHub', href: '#', icon: Github },
			{ name: 'YouTube', href: '#', icon: Youtube }
		]
	};

	const year = new Date().getFullYear();
	let {
		navigation = defaultNavigation,
		newsletterTitle = 'Subscribe to our newsletter',
		newsletterDescription = 'Stay updated with our latest news, articles, and resources delivered weekly.',
		newsletterButtonText = 'Subscribe',
		copyrightText = `${year} ZaloKit. All rights reserved.`,
		onNewsletterSubmit,
		class: className
	} = $props();

	let email = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit(event) {
		event.preventDefault();

		if (!email || isSubmitting) return;

		isSubmitting = true;

		try {
			const res = await fetch('/api/v1/newsletter/subscribe', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email })
			});
			email = '';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<footer class={cn('bg-white dark:bg-gray-900', className)}>
	<div class="max-w-7xl px-6 pb-8 pt-20 sm:pt-24 lg:px-8 lg:pt-32 mx-auto">
		<div class="xl:grid xl:grid-cols-3 xl:gap-8">
			<!-- Navigation columns -->
			<div class="gap-8 xl:col-span-2 grid grid-cols-2">
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<!-- Solutions column -->
					<div>
						<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">Solutions</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.solutions as item (item.name)}
								<li>
									<a
										href={item.href}
										class="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									>
										{item.name}
									</a>
								</li>
							{/each}
						</ul>
					</div>
					<!-- Support column -->
					<div class="mt-10 md:mt-0">
						<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">Support</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.support as item (item.name)}
								<li>
									<a
										href={item.href}
										class="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									>
										{item.name}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				</div>
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<!-- Company column -->
					<div>
						<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">Company</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.company as item (item.name)}
								<li>
									<a
										href={item.href}
										class="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									>
										{item.name}
									</a>
								</li>
							{/each}
						</ul>
					</div>
					<!-- Legal column -->
					<div class="mt-10 md:mt-0">
						<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">Legal</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.legal as item (item.name)}
								<li>
									<a
										href={item.href}
										class="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									>
										{item.name}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>

			<!-- Newsletter section -->
			<div class="mt-10 xl:mt-0">
				<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">{newsletterTitle}</h3>
				<p class="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">{newsletterDescription}</p>
				<form class="mt-6 sm:flex sm:max-w-md" onsubmit={handleSubmit}>
					<label for="email-address" class="sr-only">Email address</label>
					<Input
						type="email"
						name="email-address"
						id="email-address"
						autocomplete="email"
						required
						bind:value={email}
						disabled={isSubmitting}
						placeholder="Enter your email"
					/>
					<div class="mt-4 sm:ml-4 sm:mt-0 sm:shrink-0">
						<Button type="submit" disabled={isSubmitting || !email}>
							{#if isSubmitting}
								Subscribing...
							{:else}
								{newsletterButtonText}
							{/if}
						</Button>
					</div>
				</form>
			</div>
		</div>

		<!-- Bottom section with social links and copyright -->
		<div
			class="mt-16 border-gray-900/10 pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24 dark:border-white/10 border-t"
		>
			<!-- Social links -->
			<div class="gap-x-6 md:order-2 flex">
				{#each navigation.social as item (item.name)}
					{@const IconComponent = item.icon}
					<a
						href={item.href}
						class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
					>
						<span class="sr-only">{item.name}</span>
						<IconComponent class="size-6" aria-hidden="true" />
					</a>
				{/each}
			</div>
			<!-- Copyright -->
			<p class="mt-8 text-sm/6 text-gray-600 md:order-1 md:mt-0 dark:text-gray-400">
				&copy; {copyrightText}
			</p>
		</div>
	</div>
</footer>
