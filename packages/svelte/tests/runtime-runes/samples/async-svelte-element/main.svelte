<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve('h1')}>h1</button>
<button onclick={() => deferred.resolve('h2')}>h2</button>

<svelte:boundary>
	<svelte:element this={await deferred.promise}>hello</svelte:element>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
