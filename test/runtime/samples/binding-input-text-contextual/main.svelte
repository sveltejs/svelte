<script>
	export let items;
</script>

{#each items as item}
	<div><input bind:value={item}><p>{item}</p></div>
{/each}