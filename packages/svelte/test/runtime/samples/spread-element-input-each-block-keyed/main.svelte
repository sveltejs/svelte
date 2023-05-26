<script>
	export let items = ['value1', 'value2'];
</script>

{#each items as item (item)}
	<input value={item} {...{}} />
{/each}
