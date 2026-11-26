<script>
	
	let count = $state(0);
	const delayedCount = $derived(await push(count));
	const derivedCount = $derived(count);

	let resolvers = [];

	function push(value) {
        if (!value) return value;
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => count += 1}>
	clicks: {count} - {delayedCount} - {derivedCount}
</button> 
<button onclick={() => resolvers.shift()?.()}>shift</button>

<p>{$state.eager(count) !== count} - {$state.eager(derivedCount) !== derivedCount}</p>
