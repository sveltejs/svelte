<script>
	export let things;
	export let otherThings;
</script>

{#each things as {id, thing} (thing.id)}
	{@const otherThing = otherThings.find(ot => ot.id.id === id)}
	<div>{thing.name}</div>
{/each}
