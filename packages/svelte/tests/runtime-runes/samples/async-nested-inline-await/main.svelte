<script>
	let count = $state(1);
	let suffix = $state('a');

	async function identity(x) {
		for await (const value of [x]) {
			return value;
		}
	}

	// Starting an async helper must not untrack subsequent synchronous reads.
	const result = $derived((await count, identity(count), suffix));
</script>

<button onclick={() => count++}>count</button>
<button onclick={() => suffix = 'b'}>suffix</button>

<svelte:boundary>
	<p>{await (async (x) => await x)(await count)}</p>
	<p title={await identity(await count)}>{result}</p>

	{#snippet failed(error)}
		{error.message}
	{/snippet}
</svelte:boundary>
