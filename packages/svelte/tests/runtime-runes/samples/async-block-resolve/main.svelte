<script>
	let resolvers = [];

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}

	let count = $state(0);
</script>

<button onclick={() => count += 1}>{$state.eager(count)}</button>
<button onclick={() => resolvers.shift()?.()}>shift</button>

<svelte:boundary>
	{#if await push(count) % 2 === 0}
		<p>even</p>
	{:else}
		<p>odd</p>
	{/if}

	{#key count}
		<svelte:boundary>
			<p>{await push(count)}</p>

			{#snippet pending()}
				<p>loading...</p>
			{/snippet}
		</svelte:boundary>
	{/key}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
