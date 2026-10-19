<script>
	let n = $state(0);
	let x = $state(0);
	let cond = $state(false);
	let pend = false;

	const deferred = [];

	function delay(value) {
		if (!pend) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<svelte:boundary>
	<p>n = {n}</p>
	<p>x = {await delay(x)}</p>
	{#if cond}
		<p>cond: {await delay('e')}</p>
	{/if}

	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>

<button onclick={() => { pend = true; n++; x = 1; }}>x</button>
<button onclick={() => { n++; cond = !cond; }}>toggle</button>
<button onclick={() => deferred.pop()()}>pop</button>
