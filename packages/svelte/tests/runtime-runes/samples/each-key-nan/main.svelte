<script>
	let things = $state([{ id: NaN }]);
</script>

{#each things as thing (thing.id)}
	<p>{thing.id}</p>
{/each}
