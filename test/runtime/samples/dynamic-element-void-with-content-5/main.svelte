<script>
	const tags = [{ t: 'div', content: 'hello world' }, { t: 'input' }];
</script>

{#each tags as tag}
	{tag.t} <br />
	<svelte:element this={tag.t}>
		{#if tag.t !== 'input'}{tag.content}{/if}
	</svelte:element>
{/each}
