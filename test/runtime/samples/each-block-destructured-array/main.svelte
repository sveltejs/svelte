<script>
	export let animalPawsEntries;
</script>

{#each animalPawsEntries as [animal, pawType]}
	<p>{animal}: {pawType}</p>
{/each}
