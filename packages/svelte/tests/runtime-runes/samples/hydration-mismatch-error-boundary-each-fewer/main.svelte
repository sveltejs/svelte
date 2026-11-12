<script>
	let { browser } = $props();
	let items = browser ? [1, 2] : [1];

	function boom() {
		throw new Error('client error');
	}
</script>

<svelte:boundary>
	{#each items as item}<b>{item === 2 ? boom() : item}</b>{/each}

	{#snippet failed(error)}
		<p>failed: {error.message}</p>
	{/snippet}
</svelte:boundary>

<section><span>after</span></section>
