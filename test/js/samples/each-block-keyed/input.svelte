<script>
	export let things;
</script>

{#each things as thing (thing.id)}
	<div>{thing.name}</div>
{/each}