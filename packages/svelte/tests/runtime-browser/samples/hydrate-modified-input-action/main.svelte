<script>
	let value = $state('');
	let files = $state();
	const noop = () => {};
</script>

<input type="text" bind:value use:noop />
<input type="file" use:noop bind:files />
<p>{value}</p>
<p>{files?.item(0)?.name ?? ''}</p>
<button onclick={() => files = new DataTransfer().files}>clear</button>
