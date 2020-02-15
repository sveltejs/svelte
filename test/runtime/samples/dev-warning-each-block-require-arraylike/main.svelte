<script>
	const foo = new Set([1,2,3])
</script>

{#each foo.values() as item}
	<div>{item}</div>
{/each}