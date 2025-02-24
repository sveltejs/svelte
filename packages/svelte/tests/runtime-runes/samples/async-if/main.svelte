<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred = Promise.withResolvers()}>reset</button>
<button onclick={() => deferred.resolve(true)}>true</button>
<button onclick={() => deferred.resolve(false)}>false</button>

<svelte:boundary>
	{#if await deferred.promise}
		<h1>yes</h1>
	{:else}
		<h1>no</h1>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
