<script>
	let count = $state(0);

	let deferreds = [];

	function push() {
		const deferred = Promise.withResolvers();
		deferreds.push(deferred);
		return deferred.promise;
	}
</script>

<button onclick={() => count += 1}>increment</button>
<button onclick={() => deferreds.shift()?.resolve(count)}>shift</button>

<svelte:boundary>
	{#if count % 2 === 0}
		<p>true</p>
		<p>{await push()}</p>
	{:else}
		<p>false</p>
		<p>{await push()}</p>
	{/if}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
