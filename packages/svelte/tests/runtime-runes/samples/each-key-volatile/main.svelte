<script>
	let things = $state([
		{ group: 'a', id: 1 },
		{ group: 'b', id: 2 }
	]);

</script>


{#each things as thing ([thing.group, thing.id])}
	<p>{thing.group}-{thing.id}</p>
{/each}
