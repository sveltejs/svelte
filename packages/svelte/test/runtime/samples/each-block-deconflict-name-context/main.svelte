<script>
	export let foo;
</script>

{#each foo.bar as bar}
	<input bind:value={bar}>
{/each}
