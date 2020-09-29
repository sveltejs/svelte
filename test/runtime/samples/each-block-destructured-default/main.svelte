<script>
	export let animalEntries;
</script>

{#each animalEntries as { animal, species = 'unknown', kilogram: weight = 50 , ...props } }
	<p {...props}>{animal} - {species} - {weight}kg</p>
{/each}
