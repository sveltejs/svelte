<script lang=ts>
	let count = $state(0);

	function process(count) {
		if (count === 3) throw new Error('kaboom');
		return count;
	}
</script>

<button onclick={() => count++}>
	clicks: {count}
</button>

<svelte:boundary>
	<p>{await process(count)}</p>

	{#snippet pending()}
		<p>pending...</p>
	{/snippet}

	{#snippet failed(error, reset)}
		<button onclick={reset}>retry</button>
	{/snippet}
</svelte:boundary>
