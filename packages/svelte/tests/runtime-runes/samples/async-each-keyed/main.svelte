<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve(['a', 'b', 'c'])}>one</button>
<button onclick={() => deferred.resolve(['d', 'e', 'f', 'g'])}>two</button>
<button onclick={() => deferred.resolve(['d', 'e', 'f', 'd'])}>three</button>

<svelte:boundary>
	<div>
		{#each await deferred.promise as item (item)}
			<p>{item}</p>
		{/each}
	</div>

	{#snippet failed(e)}
		<p>{e.message}</p>
	{/snippet}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
