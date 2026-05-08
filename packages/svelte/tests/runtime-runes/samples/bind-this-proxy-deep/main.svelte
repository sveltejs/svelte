<script>
	import Row from "./Component.svelte";

	const nums = $state([]);
	const rows = $derived(nums.map(n => ({id: n, name: `Row ${n}` })));
	const refs = $state({});

	$effect(() => {
		console.log({...refs});
	})
</script>

<button onclick={() => nums.push(nums.length)}>Add</button>
{#each rows as row (row.id)}
	<Row name={row.name} bind:this={refs[row.id]} />
{/each}
