<script>
	const foo = ['a', 'b', 'c'];
</script>

{#each [...foo] as item}
	<div>{item}</div>
{/each}
