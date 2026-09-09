<script>
	const queued = [];

	function push(value) {
		if(!value) return value;
		return new Promise((resolve) => queued.push(() => resolve(value)));
	}

	let count = $state(0);
	let submits = $state(0);

	const a = $derived(push(count));
	const b = $derived(push(count));

	async function updateAfterPromise() {
		await Promise.resolve(); 
		submits += 1;
	}
</script>

<button onclick={() => (count += 1)}>increment</button>
<button onclick={updateAfterPromise}>update</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

<p>count: {count}</p>
<p>submits: {submits}</p>
<p>pending: {$effect.pending()}</p>
<p>{await a + await b}</p>
