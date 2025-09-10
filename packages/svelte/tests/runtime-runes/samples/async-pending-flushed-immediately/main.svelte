<script>
	let count = $state(0);

	let deferreds = [];

	function push() {
		const deferred = Promise.withResolvers();
		deferreds.push(deferred);
		return deferred.promise;
	}
</script>

<button onclick={() => count += 1}>{count}</button>
<button onclick={() => deferreds.shift()?.resolve(count)}>shift</button>

{#if count > 1}
	<svelte:boundary>
		<p>{await push(count)}</p>

		{#snippet pending()}
			<p>loading...</p>
		{/snippet}
	</svelte:boundary>
{/if}
