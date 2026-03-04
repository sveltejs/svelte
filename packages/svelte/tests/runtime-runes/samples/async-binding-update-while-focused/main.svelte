<script>
	let value = $state(0)
	const min = 2
	const max = 5

	$effect(() => {
		setValue()
	})

	function setValue() {
		if (value < min) {
			value = min
		}
		if (value > max) {
			value = max
		}
	}
</script>

<svelte:boundary>
	<p>{await value}</p>
	<input type="number" bind:value />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
