<script>
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
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
		<div class="gap-2 flex">
			<Button>Create Project</Button>
			<Button variant="outline">Import Project</Button>
		</div>
	</Empty.Content>
	<Button variant="link" class="text-muted-foreground" size="sm">
		<a href="#/">
			Learn More <ArrowUpRightIcon class="inline" />
		</a>
	</Button>
</Empty.Root>
