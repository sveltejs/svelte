<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve('hello')}>hello</button>
<button onclick={() => deferred.resolve('wheee')}>wheee</button>

{#snippet hello(message)}
	<h1>{message}</h1>
{/snippet}

<svelte:boundary>
	{@render hello(await deferred.promise)}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
