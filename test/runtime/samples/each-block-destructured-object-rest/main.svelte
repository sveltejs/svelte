<script>
	export let animalEntries;
</script>

{#each animalEntries as { animal, ...props } }
	<p {...props}>{animal}</p>
{/each}
