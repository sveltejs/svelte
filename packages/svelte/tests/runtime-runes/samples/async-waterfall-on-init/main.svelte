<script>
	let d1 = Promise.withResolvers();
	let d2 = Promise.withResolvers();

	let count = $state(0);
</script>

<button onclick={() => d1.resolve(true)}>resolve 1</button>
<button onclick={() => d2.resolve(true)}>resolve 2</button>

<hr>

<svelte:boundary>
	{#if await d1.promise}
		<button onclick={() => count += 1}>{count}</button>
		<p>{await d2.promise}</p>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
