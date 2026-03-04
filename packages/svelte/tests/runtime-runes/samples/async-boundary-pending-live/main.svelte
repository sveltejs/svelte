<script>
	let resolvers = [];

	function push(value) {
		const deferred = Promise.withResolvers();
		resolvers.push(() => deferred.resolve(value));
		return deferred.promise;
	}

	function shift() {
		resolvers.shift()?.();
	}

	let count = $state(0);
</script>

<button onclick={() => count += 1}>
	increment
</button>

<button onclick={shift}>
	shift
</button>

<svelte:boundary>
	<p>{await push('resolved')}</p>

	{#snippet pending()}
		<p>{count}</p>
	{/snippet}
</svelte:boundary>
