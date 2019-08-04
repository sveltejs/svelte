<script>
	export let animalEntries;
</script>

{#each animalEntries as { animal, features: { ...rest, eyes } } }
	<p {...rest}>{animal} {eyes}</p>
{/each}
