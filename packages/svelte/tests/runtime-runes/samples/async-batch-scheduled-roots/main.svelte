<script>
	let show = $state(false);
	const docs = Promise.resolve([1]);
	let el;
</script>

<button onclick={() => (show = true)}>show</button>

{#if show}
	{$effect.pending()}

	{#each await docs as doc}
		<button bind:this={el}>{(await docs).length}</button>
	{/each}
{/if}
