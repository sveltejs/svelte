<script>
	let count = $state(0);

	let resolvers = [];

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => count += 1}>{$state.eager(count)}</button>
<button onclick={() => resolvers.shift()?.()}>shift</button>

<svelte:boundary>
	{@const loaded = $state.eager(count) === count}
	<p>{await push(count)} {loaded ? '' : '(...)'}</p>

	{#snippet pending()}{/snippet}
</svelte:boundary>
