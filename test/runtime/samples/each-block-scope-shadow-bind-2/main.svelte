<script>
	let a = [
		{ a: 'Hello' }
	];
</script>

{#each a as { a }}
	{a}
	<input bind:value={a} />
{/each}