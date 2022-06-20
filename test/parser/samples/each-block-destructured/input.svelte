<script>
	export let animals;
</script>

{#each animals as [key, value, ...rest]}
	<p>{key}: {value}</p>
{/each}
