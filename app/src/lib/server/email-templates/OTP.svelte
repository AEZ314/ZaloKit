<!-- src/lib/emails/welcome.svelte -->
<script>
	import {
		Html,
		Head,
		Body,
		Preview,
		Container,
		Section,
		Text,
		Button,
		Row
	} from 'better-svelte-email';

	let { base, otp = '000000' } = $props();
</script>

<Html>
	<Head />
	<Body class="bg-zinc-100">
		<Preview preview={`Verification Code: ${otp}`} />
		<Container class="m-8 max-w-lg rounded-2xl bg-white p-8 mx-auto">
			<Section class="mx-auto text-center">
				<Text class="text-2xl font-bold text-zinc-900">Here's your verification code!</Text>
				<Text class="mt-3 text-zinc-600">
					{otp}
				</Text>
				<Row class="mt-6">
					<Button
						href={base + '/app'}
						pX={24}
						pY={14}
						class="mr-2 rounded-lg bg-orange-600 text-white"
					>
						ZaloKit
					</Button>
				</Row>
			</Section>
		</Container>
	</Body>
</Html>
