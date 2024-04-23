<script>
	let array = $state([1, 2, 3]);
</script>

<button onclick={() => array.reverse()}>reverse</button>

{#each array as item (item)}
	<p>{item}</p>
	{#if true}
		<p>({item})</p>
	{/if}
{/each}
