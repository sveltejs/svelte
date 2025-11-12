<script>
	let checked = $state(false);

	const foo = $derived(await checked);
</script>

<input type="checkbox" bind:checked />

{#each checked === foo && [1]}
	<p>{checked}</p>
{/each}
