<script>
	let x = $state(0);
	let y = $state(0);

	let deferreds = [];

	function push(key, v) {
		const d = Promise.withResolvers();
		deferreds.push({ key, v, d });
		return d.promise;
	}

	function shift(key) {
		const i = deferreds.findIndex((d) => d.key === key);
		if (i === -1) return;
		const [{ v, d }] = deferreds.splice(i, 1);
		d.resolve(v);
	}
</script>

<button onclick={() => x++}>x</button>
<button onclick={() => y++}>y</button>
<button onclick={() => shift('x')}>shift x</button>
<button onclick={() => shift('y')}>shift y</button>

<svelte:boundary>
	<p>x: {await push('x', x)}</p>
	<p>x + y: {x + y}</p>

	{#snippet pending()}
		<p>loading x...</p>
	{/snippet}
</svelte:boundary>

<svelte:boundary>
	<p>y: {await push('y', y)}</p>

	{#snippet pending()}
		<p>loading y...</p>
	{/snippet}
</svelte:boundary>
