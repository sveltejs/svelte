<script>
	let count = $state(0);
	let other = $state(0);
	let resolvers = [];

	function wait(v) {
		return new Promise((r) => resolvers.push(() => r(v)));
	}

	let test = $derived.by(() => {
		if (count > 1) {
			throw new Error('test');
		}
	});
</script>

<button onclick={() => other++}>other</button>
<button onclick={() => count++}>count</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>

<svelte:boundary>
	<p>{await wait(other)}</p>
	{#snippet pending()}<p>loading</p>{/snippet}
</svelte:boundary>

<svelte:boundary onerror={(e) => {console.log('error caught 1')}}>
	{count} / {test}
</svelte:boundary>

<svelte:boundary onerror={(e) => {console.log('error caught 2')}}>
	{count} / {test}
</svelte:boundary>
