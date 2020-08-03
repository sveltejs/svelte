<script>
	export let animalEntries;
</script>

{#each animalEntries as { animal, species = 'unknown', kilogram: weight = 50, pound = (weight * 2.2).toFixed(0), ...props } }
	<p {...props}>{animal} - {species} - {weight}kg ({pound} lb)</p>
{/each}
