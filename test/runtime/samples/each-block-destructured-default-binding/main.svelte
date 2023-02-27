<script>
	export let array = [{ value: '' }, {}];
</script>

{#each array as { value = "hello" }}
	<input bind:value />
{/each}
