<script>
	export let animalPawsEntries;
</script>

{#each animalPawsEntries as [, pawType]}
	<p>{pawType}</p>
{/each}
