<script>
	import Child from './Child.svelte';

	let a = $state(0);
	let c = $state(0);
	let show = $state(false);
	const pending = [];

	function push(key, value) {
		console.log(`${key} ${value}`);
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
<button onclick={() => c++}>c</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => resolve('p')}>shift p</button>
<button onclick={() => resolve('p', true)}>pop p</button>
<button onclick={() => resolve('q')}>shift q</button>

<svelte:boundary>
	{#if show}
		<Child {push} />
	{/if}

	<p>p: {await push('p', a + c)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
