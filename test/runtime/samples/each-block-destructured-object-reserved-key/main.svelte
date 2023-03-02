<script>
	const foo = [{ in: 'bar' }];
</script>

{#each foo as { in: bar }}
	<p>{bar}</p>
{/each}
