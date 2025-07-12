<script lang="ts">
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
	{#if count % 2}
		<p>delayed: {await push()}</p>
	{:else}
		<p>{await count}</p>
	{/if}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
