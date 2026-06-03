<script>
	let value = $state(0);
	let deferreds = [];

	function push(value) {
		const deferred = Promise.withResolvers();
		deferreds.push({ value, deferred });
		return deferred.promise;
	}

	function shift() {
		const d = deferreds.shift();
		d?.deferred.resolve(d.value);
	}
</script>

<button onclick={() => value++}>increment</button>
<button onclick={() => shift()}>shift</button>

<svelte:boundary>
	<p>{await push(value)}</p>
	<p>{await push(value)}</p>
	<p>{await push(value)}</p>

	<p>pending: {$effect.pending()}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>


