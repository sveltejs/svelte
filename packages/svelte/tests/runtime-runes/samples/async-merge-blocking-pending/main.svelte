<script>
	let n = $state(0);
	let x = $state(0);
	let cond = $state(false);
	let pend = false;

	const pending = new Map();

	function delay(key, value) {
		console.log(`delay ${key}`);
		if (!pend) return value;
		return new Promise((resolve) => pending.set(key, () => resolve(value)));
	}

	function resolve(key) {
		pending.get(key)();
		pending.delete(key);
	}
</script>

<svelte:boundary>
	<p>n = {n}</p>
	<p>x = {await delay(`x${x}`, x)}</p>
	{#if cond}
		<p>cond: {await delay('e', 'e')}</p>
	{/if}

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>

<button onclick={() => { pend = true; n++; x = 1; }}>X</button>
<button onclick={() => { n++; cond = true; }}>Y</button>
<button onclick={() => { n++; cond = false; }}>Z</button>
<button onclick={() => { n++; cond = true; }}>W</button>
<button onclick={() => resolve('e')}>resolve e</button>
<button onclick={() => resolve('x1')}>resolve x1</button>
