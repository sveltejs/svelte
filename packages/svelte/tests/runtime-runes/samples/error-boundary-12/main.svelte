<script>
	let count = $state(0);

	const things = $derived.by(() => {
		if (count === 1) {
			throw new Error('123')
		}
		return [1, 2 ,3]
	})
</script>

<button onclick={() => count++}>change</button>

<svelte:boundary>
	{#each things as thing}
		<p>{thing}</p>
	{/each}

	{#snippet failed()}
		<p>Error occured</p>
	{/snippet}
</svelte:boundary>
