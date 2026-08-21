<script>
	let index = $state(0);

	async function fn(id) {
		if (id === 2) throw new Error('Simulated TypeError');
		return id;
	}

	function onerror(error) {
		console.log(error.message);
	}
</script>

<button onclick={() => (index = 1)}>Trigger</button>

<svelte:boundary {onerror}>
	{#snippet pending()}
		<p>Loading...</p>
	{/snippet}

	{#snippet failed(error)}
		<p>Error Caught: {error.message}</p>
	{/snippet}

	{#each [[1], [2]][index] as id (id)}
		{@const result = await fn(id)}
		<p>{result}</p>
	{/each}
</svelte:boundary>
