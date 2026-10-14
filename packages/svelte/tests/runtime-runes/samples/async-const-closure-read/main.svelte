<script>
	async function getValue() {
		return new Set(['a', 'b', 'c']);
	}

	const value = await getValue();
</script>

{#each [['a', 'b'], ['a', 'x']] as keys}
	{@const all_present = keys.every((k) => value.has(k))}
	<p>{all_present}</p>
{/each}
