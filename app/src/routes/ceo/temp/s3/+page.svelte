<script>
	export let data;

	let file = null;
	let uploading = false;
	let message = '';

	async function onSubmit(event) {
		event.preventDefault();
		message = '';

		if (!file) {
			message = 'Select a file first.';
			return;
		}

		if (!data.write) {
			message = 'No signed upload URL.';
			return;
		}

		uploading = true;

		try {
			const res = await fetch(data.write, {
				method: 'PUT',
				headers: {
					'Content-Type': file.type || 'application/octet-stream'
				},
				body: file
			});

			if (!res.ok) {
				const text = await res.text().catch(() => '');
				throw new Error(`Upload failed: ${res.status} ${text}`);
			}

			message = 'Upload successful.';

			// optional: force img refresh in case of caching
			// if data.read exists, reassign with cache-buster
			if (data.read) {
				data.read = `${data.read}${data.read.includes('?') ? '&' : '?'}t=${Date.now()}`;
			}
		} catch (err) {
			message = err?.message ?? 'Upload error';
		} finally {
			uploading = false;
		}
	}

	function onFileChange(e) {
		const input = e.currentTarget;
		file = input.files?.[0] ?? null;
	}
</script>

<h1>S3 Test (SeaweedFS)</h1>

<form onsubmit={onSubmit}>
	<label>
		Select image:
		<input type="file" accept="image/*" onchange={onFileChange} />
	</label>

	<button type="submit" disabled={uploading || !data.write}>
		{uploading ? 'Uploading…' : 'Upload'}
	</button>
</form>

{#if data.read}
	<h2>Current image</h2>
	<img src={data.read} alt="" style="max-width: 300px; display: block; margin-bottom: 1rem;" />
{:else}
	<p>No existing image.</p>
{/if}

{#if data.error}
	<p style="color: red;">S3 test failed.</p>
	{#if data.error}
		<pre>error: {data.error}</pre>
	{/if}
{/if}

{#if message}
	<p>message: {message}</p>
{/if}
