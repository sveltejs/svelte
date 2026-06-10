<script>
	let count = $state(0);

	const queued = [];

	function push(v) {
		if (v === 0) return v;

		return new Promise((fulfil,reject) => {
			queued.push(() => v === 3 ? reject('boom') : fulfil(v));
		});
	}
</script>

<button onclick={() => count++}>increment</button>
<button onclick={() => queued.pop()?.()}>pop</button>

<svelte:boundary>
	{await push(count)}

	{#snippet failed()}failed{/snippet}
</svelte:boundary>
