<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve(1)}>1</button>
<button onclick={() => deferred.resolve(2)}>2</button>

<svelte:boundary>
	{#key await deferred.promise}
		<h1>hello</h1>
	{/key}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
