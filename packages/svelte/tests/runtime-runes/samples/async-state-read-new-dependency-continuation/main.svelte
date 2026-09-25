<script>
	let a = $state(0);
	let t = $state(0);

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

<button onclick={() => a++}>a</button>
<button onclick={() => t++}>t</button>
<button onclick={() => shift('a')}>shift a</button>
<button onclick={() => shift('t')}>shift t</button>

<svelte:boundary>
	<p>async a: {await push('a', a)}</p>

	<!-- reads `a` after an await, but only once t > 0 -->
	<p>late read: {(await push('t', t), t > 0 ? a : -1)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
