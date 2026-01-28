<script>
	let count = $state(0);

	function maybe_throw() {
		if (count > 1) {
			throw new Error('test');
		}

		return count;
	}
</script>

<svelte:boundary onerror={(e) => { throw(e) }}>
	<div>Count: {count}</div>
	<button onclick={() => count++}>Increment</button>
	{count} / {maybe_throw()}
</svelte:boundary>

