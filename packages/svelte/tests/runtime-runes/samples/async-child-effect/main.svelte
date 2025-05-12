<script>
	let input = $state('a');

	let queue = [];

	function push(value) {
		const deferred = Promise.withResolvers();
		queue.push(() => deferred.resolve(value));
		return deferred.promise;
	}
</script>

<button onclick={() => queue.shift()()}>shift</button>

<svelte:boundary>
	<button onclick={() => input += 'a'}>+</button>
	<p>{await push(input.toUpperCase())}</p>

	{#if true}
		<p>{input}</p>
	{/if}

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>
