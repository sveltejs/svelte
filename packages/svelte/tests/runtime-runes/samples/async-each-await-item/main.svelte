<script>
	let items = $state([
		Promise.withResolvers(),
		Promise.withResolvers(),
		Promise.withResolvers()
	]);
</script>

<button onclick={() => {
	items[0].resolve('a');
	items[1].resolve('b');
	items[2].resolve('c');
}}>step 1</button>

<button onclick={() => {
	items = [
		Promise.withResolvers(),
		Promise.withResolvers(),
		Promise.withResolvers(),
		Promise.withResolvers()
	]
}}>step 2</button>

<button onclick={() => {
	items[0].resolve('b');
	items[1].resolve('c');
	items[2].resolve('d');
	items[3].resolve('e');
}}>step 3</button>

<svelte:boundary>
	{#each items as deferred}
		<p>{await deferred.promise}</p>
	{/each}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
