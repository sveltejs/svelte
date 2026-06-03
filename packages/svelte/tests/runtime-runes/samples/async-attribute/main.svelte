<script>
	let deferred = $state(Promise.withResolvers());
</script>

<button onclick={() => deferred.resolve('cool')}>cool</button>
<button onclick={() => deferred.resolve('neat')}>neat</button>
<button onclick={() => deferred = Promise.withResolvers()}>reset</button>

<svelte:boundary>
	<p class={await deferred.promise}>hello</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
