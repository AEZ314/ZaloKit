<script>
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Code from '@lucide/svelte/icons/code';
	import FileText from '@lucide/svelte/icons/file-text';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Video from '@lucide/svelte/icons/video';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import { Button } from '$lib/components/ui/button/index.js';
	import { authClient } from '$lib/client/auth-client';
	import Theme from '../ThemeToggle.svelte';

	const session = authClient.useSession();

	let mobileOpen = $state(false);
	let resourcesOpen = $state(false);

	const resources = [
		{
			label: 'Documentation',
			description: 'Start building with our guides',
			icon: FileText,
			href: '#'
		},
		{ label: 'API Reference', description: 'Complete API documentation', icon: Code, href: '#' },
		{ label: 'Tutorials', description: 'Step-by-step learning', icon: BookOpen, href: '#' },
		{ label: 'Video Guides', description: 'Watch and learn', icon: Video, href: '#' },
		{ label: 'Community', description: 'Join the discussion', icon: MessageSquare, href: '#' },
		{ label: 'Blog', description: 'Latest news and updates', icon: Newspaper, href: '#' }
	];
</script>

<!-- Navbar with mega menu -->
<nav class="sticky top-0 z-50 border-b bg-background">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center gap-8">
				<a href="/" class="text-lg font-bold">ZaloKit</a>

				<div class="hidden items-center gap-6 md:flex">
					<!-- Mega menu trigger -->
					<div class="relative">
						<button
							class="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
							onclick={() => (resourcesOpen = !resourcesOpen)}
						>
							More
							<ChevronDown
								class="h-4 w-4 {resourcesOpen ? 'rotate-180' : ''} transition-transform"
							/>
						</button>

						{#if resourcesOpen}
							<div
								class="absolute left-0 z-50 mt-4 w-[420px] rounded-xl border bg-popover p-4 shadow-lg"
							>
								<div class="grid grid-cols-2 gap-2">
									{#each resources as item}
										<a
											href={item.href}
											class="flex items-start gap-3 rounded-lg p-3 hover:bg-accent"
										>
											<div
												class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"
											>
												<item.icon class="h-5 w-5 text-primary" />
											</div>
											<div>
												<p class="text-sm font-medium">{item.label}</p>
												<p class="text-xs text-muted-foreground">{item.description}</p>
											</div>
										</a>
									{/each}
								</div>
								<div class="mt-4 border-t pt-4">
									<a
										href="#!"
										class="flex items-center justify-between rounded-lg bg-muted p-3 hover:bg-muted/80"
									>
										<div>
											<p class="text-sm font-medium">Enterprise Solutions</p>
											<p class="text-xs text-muted-foreground">Custom solutions for large teams</p>
										</div>
										<span class="text-sm text-primary">Contact sales →</span>
									</a>
								</div>
							</div>
						{/if}
					</div>
					<a
						href="/home/pricing"
						class="text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						Pricing
					</a>
					<a
						href="/home/resources/About/Getting%20Started"
						class="text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						Resources
					</a>
					<a
						href="/home/contact"
						class="text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						Contact
					</a>
					<a
						href="https://github.com/AEZ314/ZaloKit"
						class="text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						GitHub
					</a>
				</div>
			</div>

			<div class="hidden items-center gap-4 md:flex">
				{#if $session.data}
					<a
						href="/app"
						class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Dashboard
					</a>
				{:else}
					<a
						href="/home/auth?mode=register"
						class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Get started
					</a>
				{/if}
				<Theme />
			</div>

			<button
				class="rounded-md p-2 hover:bg-accent md:hidden"
				onclick={() => (mobileOpen = !mobileOpen)}
			>
				{#if mobileOpen}
					<X class="h-6 w-6" />
				{:else}
					<Menu class="h-6 w-6" />
				{/if}
			</button>
		</div>
	</div>

	{#if mobileOpen}
		<div class="border-t px-4 py-4 md:hidden">
			<div class="space-y-2">
				<a href="#!" class="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
					>Products</a
				>
				<div class="space-y-1 pl-4">
					<p class="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Resources</p>
					{#each resources as item}
						<a
							href={item.href}
							class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
						>
							<item.icon class="h-4 w-4 text-muted-foreground" />
							{item.label}
						</a>
					{/each}
				</div>
				<a href="#!" class="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
					>Pricing</a
				>
				<a href="#!" class="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
					>Company</a
				>
			</div>
		</div>
	{/if}
</nav>

{#if resourcesOpen}
	<button class="fixed inset-0 z-40" onclick={() => (resourcesOpen = false)} aria-label="Close"
	></button>
{/if}
