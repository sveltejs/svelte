<script>
	export let values;
</script>

{#each values as value (value.id)}
	({value.id})
{/each}
