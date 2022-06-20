<script>
	export let columns;
	export let rows;
</script>

{#each columns as x}
	{#each rows as y}
		<div>{x}, {y}</div>
	{/each}
{/each}
