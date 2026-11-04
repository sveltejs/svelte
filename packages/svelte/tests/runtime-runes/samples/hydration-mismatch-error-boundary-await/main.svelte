<script>
	let { browser } = $props();
	let value = browser ? 1 : new Promise(() => {});

	function boom() {
		throw new Error('client error');
	}
</script>

<svelte:boundary>
	{#await value}<i>pending</i>{:then v}<b>{boom()}</b>{/await}

	{#snippet failed(error)}
		<p>failed: {error.message}</p>
	{/snippet}
</svelte:boundary>

<section><span>after</span></section>
