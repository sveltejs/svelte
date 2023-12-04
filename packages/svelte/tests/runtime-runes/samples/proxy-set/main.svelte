<script>
	const set = $state(new Set([1, 2, 3]));
	const sum = $derived(Array.from(set).reduce((a, b) => a + b, 0));
</script>

<button onclick={() => set.add(set.size + 1)}>
	{[...set].join(' + ')} = {sum}
</button>

<button onclick={() => { set.delete(2) }}>
	delete 2
</button>

<button onclick={() => { set.clear(); set.add(1) }}>
	clear
</button>

{#each set as n}
	<span>{n}</span>
{/each}

<strong>set.has(2): {set.has(2)}</strong>
