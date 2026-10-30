<script>
	import Child from './Child.svelte';

	let a = $state(0);
	let show = $state(false);

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
<button onclick={() => (show = true)}>show</button>
<button onclick={() => shift('b')}>shift b</button>
<button onclick={() => shift('p')}>shift p</button>
<button onclick={() => shift('q')}>shift q</button>

<svelte:boundary>
	<p>b: {await push('b', a)}</p>

	{#snippet pending()}
		<p>loading b...</p>
	{/snippet}
</svelte:boundary>

{#if show}
	<svelte:boundary>
		<p>p: {await push('p', a)}</p>

		{#snippet pending()}
			<p>loading p...</p>
		{/snippet}
	</svelte:boundary>

	<svelte:boundary>
		<Child {a} {push} />

		{#snippet pending()}
			<p>loading q...</p>
		{/snippet}
	</svelte:boundary>
{/if}
