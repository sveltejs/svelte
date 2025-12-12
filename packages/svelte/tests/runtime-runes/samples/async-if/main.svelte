<script>
	let condition = $state(true);

	let deferreds = [];

	function push(value) {
		const deferred = Promise.withResolvers();
		deferreds.push({ deferred, value });
		return deferred.promise;
	}
</script>

<button onclick={() => {
	const d = deferreds.shift();
	d?.deferred.resolve(d.value);
}}>shift</button>
<button onclick={() => condition = true}>true</button>
<button onclick={() => condition = false}>false</button>

<svelte:boundary>
	{#if await push(condition)}
		<h1>yes</h1>
	{:else}
		<h1>no</h1>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
