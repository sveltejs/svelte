<script>
	const n = $derived(await Promise.resolve(1));
</script>

{#snippet child(n)}
	<div>{n}</div>
{/snippet}

{#if n}
	{@render child(n)}
{/if}

<p>after</p>
