<script>
	export let animals;
</script>

{#each animals as animal, i}
	<p>{i}: {animal}</p>
{/each}
