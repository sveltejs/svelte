<script>
	export let items;
</script>

{#each items as item}
	<div><input bind:value={item.description}><p>{item.description}</p></div>
{/each}