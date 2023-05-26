<script>
	const a = [[1, 2, 3, 4, 5]];
</script>

{#each a as [first, second, ...[third, ...{ length }]]}
	<p>{first}, {second}, {length}</p>
	<input bind:value={third} />
	<input bind:value={length} />
{/each}
