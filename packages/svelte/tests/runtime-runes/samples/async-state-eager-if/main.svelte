<script>
	let count = $state(0);
	let eager = $derived($state.eager(count));

	let resolvers = [];

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => count += 1}>{eager}</button>
<button onclick={() => resolvers.shift()?.()}>shift</button>

<svelte:boundary>
	<p>{await push(count)}</p>

	{#if count !== eager}
		<p>updating</p>
	{/if}

	{#snippet pending()}{/snippet}
</svelte:boundary>
