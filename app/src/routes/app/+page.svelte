<script>
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import AddWorkspace from './AddWorkspace.svelte';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon"></Empty.Media>
		<Empty.Title>No Projects Yet</Empty.Title>
		<Empty.Description>
			You haven't created any projects yet. Get started by creating your first project.
		</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		<div class="flex gap-2">
			<Button>Create Project</Button>
			<Button variant="outline">Import Project</Button>
			<AddWorkspace>
				{#snippet trigger()}
					<Button variant="outline">Add Workspace</Button>
				{/snippet}
			</AddWorkspace>
		</div>
	</Empty.Content>
	<Button variant="link" class="text-muted-foreground" size="sm">
		<a href="#/">
			Learn More <ArrowUpRightIcon class="inline" />
		</a>
	</Button>
</Empty.Root>
