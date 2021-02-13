<script>
	export let animalEntries;
	export const defaultHeight = 30;
</script>

{#each animalEntries as { animal, species = 'unknown', kilogram: weight = 50, pound = (weight * 2.2).toFixed(0), height = defaultHeight, bmi = weight / (height * height), ...props } }
	<p {...props}>{animal} - {species} - {weight}kg ({pound} lb) - {height}cm - {bmi}</p>
{/each}
