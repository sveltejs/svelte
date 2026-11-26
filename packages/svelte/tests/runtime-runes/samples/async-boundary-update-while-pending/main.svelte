<script>
	let queue = [];

	function push(value) {
		const deferred = Promise.withResolvers();
		queue.push(() => deferred.resolve(value));
		return deferred.promise;
	}

	let count = $state(0);
</script>

<button onclick={() => queue.shift()()}>shift</button>
<button onclick={() => count++}>increment</button>

<svelte:boundary>
	{await push(count)}
	{#snippet pending()}loading{/snippet}
</svelte:boundary>
