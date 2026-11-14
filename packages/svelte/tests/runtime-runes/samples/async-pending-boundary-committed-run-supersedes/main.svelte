<script>
	let a = $state(0);
	let show = $state(false);
	const pending = [];

	function push(key, value) {
		return new Promise((resolve) => pending.push({ key, value, resolve }));
	}

	function resolve(key, last = false) {
		const matching = pending.filter((d) => d.key === key);
		const entry = last ? matching.at(-1) : matching[0];
		if (!entry) return;
		pending.splice(pending.indexOf(entry), 1);
		entry.resolve(entry.value);
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => resolve('b')}>shift b</button>
<button onclick={() => resolve('p')}>shift p</button>
<button onclick={() => resolve('p', true)}>pop p</button>

<svelte:boundary>
	<p>b: {await push('b', a)}</p>
	{#snippet pending()}<p>loading b...</p>{/snippet}
</svelte:boundary>

{#if show}
	<svelte:boundary>
		<p>p: {await push('p', a)}</p>
		{#snippet pending()}<p>loading p...</p>{/snippet}
	</svelte:boundary>
{/if}
