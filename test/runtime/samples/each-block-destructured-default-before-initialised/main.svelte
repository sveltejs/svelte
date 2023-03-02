<script>
	let array = [{a: 1, c: 2}];
</script>

{#each array as { a, b = c, c }}
	{a}{b}{c}
{/each}
