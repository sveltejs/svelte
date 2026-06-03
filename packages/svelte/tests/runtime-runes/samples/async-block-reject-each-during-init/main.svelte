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
<button onclick={() => deferreds.shift()?.resolve([count])}>resolve</button>
<button onclick={() => deferreds.shift()?.reject(new Error('oops'))}>reject</button>

<svelte:boundary>
	{#if count % 2 === 0}
		<p>true</p>
		{#each await push() as count}<p>{count}</p>{/each}
	{:else}
		<p>false</p>
		{#each await push() as count}<p>{count}</p>{/each}
	{/if}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
