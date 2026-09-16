<script>
	let a = $state(0);
	let show1 = $state(false);
	let show2 = $state(false);

	let deferreds = [];

	function push(key, v) {
		const d = Promise.withResolvers();
		deferreds.push({ key, v, d });
		return d.promise;
	}

	function shift(key, override) {
		const i = deferreds.findIndex((d) => d.key === key);
		if (i === -1) return;
		const [{ v, d }] = deferreds.splice(i, 1);
		d.resolve(override ?? v);
	}
</script>

<button onclick={() => a++}>up</button>
<button onclick={() => a--}>down</button>
<button onclick={() => (show1 = true)}>show1</button>
<button onclick={() => (show2 = true)}>show2</button>
<button onclick={() => shift('a')}>shift a</button>
<button onclick={() => shift('t', 1)}>shift t</button>

{#if show1}
	<svelte:boundary>
		<!-- no state deps initially; reads `a` for the first time only when
		     the awaited value (controlled by the test) says so -->
		<p>late read: {(await push('t', 0)) > 0 ? a : -1}</p>

		{#snippet pending()}
			<p>loading 1...</p>
		{/snippet}
	</svelte:boundary>
{/if}

{#if show2}
	<svelte:boundary>
		<p>async a: {await push('a', a)}</p>

		{#snippet pending()}
			<p>loading 2...</p>
		{/snippet}
	</svelte:boundary>
{/if}
