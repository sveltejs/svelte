<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve(['a', 'b', 'c'])}>abc</button>
<button onclick={() => deferred.resolve(['d', 'e', 'f', 'g'])}>defg</button>

<svelte:boundary>
	{#each await deferred.promise as item}
		<p>{item}</p>
	{/each}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
