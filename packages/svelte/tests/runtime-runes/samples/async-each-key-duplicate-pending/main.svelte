<script>
	let items = $state([1, 2]);
	let count = $state(0);

	const resolvers = [];

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => resolvers.shift()?.()}>shift</button>
<button onclick={() => {
	count += 1;
	items.push(1);
}}>add</button>

<svelte:boundary>
	<p>{await push(count)}</p>

	{#snippet pending()}{/snippet}
</svelte:boundary>

{#each items as item (item)}
	<span>{item}</span>
{/each}
