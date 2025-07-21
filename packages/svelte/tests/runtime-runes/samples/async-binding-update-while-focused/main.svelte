<script>
	let value = $state('a');

	function push(value) {
		// Cannot use a queue and flush it manually here, because we need the input to be focused
		const deferred = Promise.withResolvers();
		setTimeout(() => deferred.resolve(value), 100);
		return deferred.promise;
	}
</script>

<svelte:boundary>
	<p>{await push(value)}</p>
	<input bind:value />

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>
