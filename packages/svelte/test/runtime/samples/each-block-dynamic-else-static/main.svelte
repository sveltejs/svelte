<script>
	export let animals;
</script>

{#each animals as animal}
	<p>{animal}</p>
{:else}
	<p>no animals</p>
{/each}