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
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { authClient } from '$lib/auth-client';

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
<nav class="top-0 bg-background sticky z-50 border-b">
	<div class="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
		<div class="h-16 flex items-center justify-between">
			<div class="gap-8 flex items-center">
				<a href="/" class="text-lg font-bold">ZaloKit</a>

				<div class="md:flex gap-6 hidden items-center">
					<!-- Mega menu trigger -->
					<div class="relative">
						<button
							class="gap-1 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center"
							onclick={() => (resourcesOpen = !resourcesOpen)}
						>
							More
							<ChevronDown
								class="h-4 w-4 {resourcesOpen ? 'rotate-180' : ''} transition-transform"
							/>
						</button>

						{#if resourcesOpen}
							<div
								class="left-0 mt-4 rounded-xl bg-popover p-4 shadow-lg absolute z-50 w-[420px] border"
							>
								<div class="gap-2 grid grid-cols-2">
									{#each resources as item}
										<a
											href={item.href}
											class="gap-3 rounded-lg p-3 hover:bg-accent flex items-start"
										>
											<div
												class="h-10 w-10 rounded-lg bg-primary/10 flex shrink-0 items-center justify-center"
											>
												<item.icon class="h-5 w-5 text-primary" />
											</div>
											<div>
												<p class="font-medium text-sm">{item.label}</p>
												<p class="text-xs text-muted-foreground">{item.description}</p>
											</div>
										</a>
									{/each}
								</div>
								<div class="mt-4 pt-4 border-t">
									<a
										href="#!"
										class="rounded-lg bg-muted p-3 hover:bg-muted/80 flex items-center justify-between"
									>
										<div>
											<p class="font-medium text-sm">Enterprise Solutions</p>
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

			<div class="md:flex gap-4 hidden items-center">
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

				<Button onclick={toggleMode} variant="outline" size="icon">
					<SunIcon
						class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
					/>
					<MoonIcon
						class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>

			<button
				class="md:hidden rounded-md p-2 hover:bg-accent"
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
		<div class="md:hidden px-4 py-4 border-t">
			<div class="space-y-2">
				<a href="#!" class="rounded-md px-3 py-2 text-base font-medium hover:bg-accent block"
					>Products</a
				>
				<div class="space-y-1 pl-4">
					<p class="text-xs font-semibold text-muted-foreground px-3 py-1 uppercase">Resources</p>
					{#each resources as item}
						<a
							href={item.href}
							class="gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent flex items-center"
						>
							<item.icon class="h-4 w-4 text-muted-foreground" />
							{item.label}
						</a>
					{/each}
				</div>
				<a href="#!" class="rounded-md px-3 py-2 text-base font-medium hover:bg-accent block"
					>Pricing</a
				>
				<a href="#!" class="rounded-md px-3 py-2 text-base font-medium hover:bg-accent block"
					>Company</a
				>
			</div>
		</div>
	{/if}
</nav>

{#if resourcesOpen}
	<button class="inset-0 fixed z-40" onclick={() => (resourcesOpen = false)} aria-label="Close"
	></button>
{/if}
