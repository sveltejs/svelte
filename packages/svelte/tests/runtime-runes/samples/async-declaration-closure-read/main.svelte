<script>
	async function getValue() {
		return new Set(['a', 'b', 'c']);
	}
</script>

{#snippet outer()}
	{const value = $derived(await getValue())}
	{#snippet inner(keys)}
		{const all_present = $derived(keys.every((k) => value.has(k)))}
		<p>{all_present}</p>
	{/snippet}
	{@render inner(['a', 'b'])}
	{@render inner(['a', 'x'])}
{/snippet}

{@render outer()}
