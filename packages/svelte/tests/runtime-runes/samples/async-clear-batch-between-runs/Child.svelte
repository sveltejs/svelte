<script>
	let { x, y, deferred } = $props();

	y = await deferred.promise;
</script>

<p>x: {x}</p>

<svelte:boundary>
	{#snippet pending()}
		<p>Loading...</p>
	{/snippet}

	<p>y: {y}</p>
</svelte:boundary>
