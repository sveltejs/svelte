<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve('hello')}>hello</button>
<button onclick={() => deferred.resolve('goodbye')}>goodbye</button>

<svelte:boundary>
	<h1>{@html await deferred.promise}</h1>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
