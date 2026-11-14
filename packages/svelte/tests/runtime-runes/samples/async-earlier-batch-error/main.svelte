<script>
	let a = $state(0);
	let b = $state(0);

	const queues = { f: [], g: [] };

	function later(key, value) {
		const d = Promise.withResolvers();
		queues[key].push(() => (value === 'boom' ? d.reject(value) : d.resolve(value)));
		return d.promise;
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => queues.f.shift()?.()}>f first</button>
<button onclick={() => queues.f.pop()?.()}>f last</button>
<button onclick={() => queues.g.shift()?.()}>g</button>

<svelte:boundary>
	<p>a={a} f={await later('f', a === 1 && b === 0 ? 'boom' : `${a}/${b}` )}</p>
	<i>{await later('g', b)}</i>

	{#snippet pending()}loading{/snippet}
	{#snippet failed(error)}failed: {error}{/snippet}
</svelte:boundary>
