<script>
	let items1 = $state(typeof window !== 'undefined' ? [{name: 'a'}]: []);
	let items2 = $state(typeof window === 'undefined' ? [{name: 'a'}]: []);
</script>

{#each items1 as item}
	<p>{item.name}</p>
{:else}
	<p>empty</p>
{/each}

{#each items2 as item}
	<p>{item.name}</p>
{:else}
	<p>empty</p>
{/each}
