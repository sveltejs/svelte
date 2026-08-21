<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve('hello')}>hello</button>
<button onclick={() => deferred.resolve('goodbye')}>goodbye</button>

<svelte:boundary>
	<h1>{await deferred.promise}</h1>

	{#if $effect.pending()}
		<p>updating...</p>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
