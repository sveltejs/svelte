<script>
	let a = $state(0);
	let c = $state(0);
	let show = $state(false);

	let deferreds = [];

	function push(key, v) {
		const d = Promise.withResolvers();
		deferreds.push({ key, v, d });
		return d.promise;
	}

	function resolve(key, last = false) {
		const matching = deferreds.filter((d) => d.key === key);
		const entry = last ? matching.at(-1) : matching[0];
		if (!entry) return;
		deferreds.splice(deferreds.indexOf(entry), 1);
		entry.d.resolve(entry.v);
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => c++}>c</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => resolve('b')}>shift b</button>
<button onclick={() => resolve('p')}>shift p</button>
<button onclick={() => resolve('p', true)}>pop p</button>

<svelte:boundary>
	<p>b: {await push('b', a)}</p>

	{#snippet pending()}
		<p>loading b...</p>
	{/snippet}
</svelte:boundary>

{#if show}
	<svelte:boundary>
		<p>p: {await push('p', a + c)}</p>

		{#snippet pending()}
			<p>loading p...</p>
		{/snippet}
	</svelte:boundary>
{/if}
