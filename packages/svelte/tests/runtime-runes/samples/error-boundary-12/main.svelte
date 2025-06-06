<script>
	let count = $state(0);

	const d = $derived.by(() => {
		if (count === 1) {
			throw new Error('kaboom')
		}
		return count
	})
</script>

<button onclick={() => count++}>change</button>

<svelte:boundary>
	{d}

	{#snippet failed()}
		<p>Error occured</p>
	{/snippet}
</svelte:boundary>
